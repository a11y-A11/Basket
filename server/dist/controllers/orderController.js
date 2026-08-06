import { prisma } from "../config/prisma.js";
import { inngest } from "../inngest/index.js";
// Create order
// POST/ API/ Orders
export const createOrder = async (req, res) => {
    const { items, shippingAddress, paymentMethod } = req.body;
    // Check iif order items are empty
    if (!items || items.length === 0) {
        return res.status(400).json({ message: "No order items" });
    }
    // Look up actual prices from the database
    const productIds = items.map((i) => i.product);
    const products = await prisma.product.findMany({ where: { id: { in: productIds } } });
    const productMap = {};
    products.forEach((p) => (productMap[p.id] = p));
    // Check if product is in stock
    for (const item of items) {
        const product = productMap[item.product];
        if (!product || (product.stock ?? 0) < item.quantity) {
            return res.status(404).json({ message: "Product out of stock" });
        }
    }
    const orderItems = items.map((item) => {
        const dbProduct = productMap[item.product];
        if (!dbProduct)
            throw new Error(`Product ${item.product} not found`);
        return {
            product: dbProduct.id, name: dbProduct.name, image: dbProduct.image, price: dbProduct.price, quantity: item.quantity, unit: dbProduct.unit,
        };
    });
    const subtotal = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const isDhaka = shippingAddress.city.trim().toLowerCase() === "dhaka";
    const deliveryFee = subtotal > 899 ? 0 : isDhaka ? 80 : 120;
    const total = Math.round((subtotal + deliveryFee) * 100) / 100;
    const order = await prisma.order.create({
        data: {
            userId: req.user.id,
            items: orderItems,
            shippingAddress, paymentMethod, subtotal, deliveryFee, total,
            statusHistory: [{ status: "Placed", note: "Order placed successfully", timestamp: new Date }]
        }
    });
    if (paymentMethod === "card") {
        // Stripe payment link
    }
    res.json({ order });
    // Decrease stock
    for (const item of orderItems) {
        await prisma.product.update({
            where: { id: item.product }, data: { stock: { decrement: item.quantity } }
        });
    }
    // Send stock update events for each product in the order
    for (const item of orderItems) {
        await inngest.send({ name: "inventory/stock.updated", data: { productId: item.product } });
    }
    await inngest.send({ name: "order/placed", data: { orderId: order.id } });
};
// Get user's orders
// Get/ API/ orders
export const getUserOrders = async (req, res) => {
    const { status } = req.query;
    const where = {
        userId: req.user.id,
        NOT: [{ paymentMethod: "card", isPaid: false }]
    };
    if (status && status !== "All") {
        where.status = status;
    }
    const orders = await prisma.order.findMany({
        where, include: { deliveryPartner: { select: { name: true, phone: true } } }, orderBy: { createdAt: "desc" },
    });
    res.json({ orders });
};
// Get single order
// Get/ API/ orders/ :id
export const getOrder = async (req, res) => {
    const order = await prisma.order.findFirst({
        where: { id: req.params.id, userId: req.user.id },
        include: { deliveryPartner: { select: { name: true, phone: true,
                    avatar: true, vehicleType: true } } }
    });
    if (!order) {
        return res.status(404).json({ message: "Order not found" });
    }
    res.json({ order });
};
// Update order status (admin)
// PUT/ API/ orders/ :id/ status
export const updateOrderStatus = async (req, res) => {
    const { status, note } = req.body;
    const order = await prisma.order.findUnique({ where: { id: req.params.id } });
    if (!order) {
        return res.status(404).json({ message: "Order not found" });
    }
    const history = (Array.isArray(order.statusHistory) ? order.statusHistory : []);
    history.push({ status, note: note || `Order ${status.toLowerCase()}`, timeStamp: new Date() });
    const updateOrder = await prisma.order.update({
        where: { id: req.params.id }, data: { status, statusHistory: history }
    });
    res.json({ order: updateOrder });
};
// Get all orders (admin)
// GET/ API/ orders/ all
export const getAllOrders = async (req, res) => {
    const order = await prisma.order.findMany({ where: { NOT: [{ paymentMethod: "card", isPaid: false }] },
        include: {
            user: { select: { name: true, email: true } },
            deliveryPartner: { select: { name: true, phone: true, email: true } }
        },
        orderBy: { createdAt: "desc" },
    });
    res.json({ order });
};
// Get Order Location
// GET/ API/ orders/ :id/ Location
export const getOrderLocation = async (req, res) => {
    const order = await prisma.order.findFirst({ where: { id: req.params.id, userId: req.user.id },
        select: { liveLocation: true, status: true } });
    if (!order)
        return res.status(404).json({ message: " Order not found" });
    res.json({ liveLocation: order.liveLocation, status: order.status });
};
