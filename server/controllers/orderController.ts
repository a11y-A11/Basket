import { Request, Response } from "express";
import { prisma } from "../config/prisma.js";
import { inngest } from "../inngest/index.js";
import Stripe from 'stripe';

// Create order
// POST/ API/ Orders
export const createOrder = async (req: Request, res: Response)=>{
    const {items, shippingAddress, paymentMethod} = req.body;

    // Check iif order items are empty
    if(!items || items.length === 0){
        return res.status(400).json({message: "No order items"})
    }

    // Look up actual prices from the database
    const productIds = items.map((i: any)=> i.product);
    const products = await prisma.product.findMany({where: {id: {in: productIds}}})
    const productMap: Record<string, (typeof products)[0]> = {}

    products.forEach((p: any)=> (productMap[p.id] = p))

    // Check if product is in stock
    {/*for(const item of items){
        const product = productMap[item.product]
        if(!product || (product.stock ?? 0) <item.quantity){
            return res.status(404).json({ message: "Product out of stock"});
        }
    }*/}
    for (const item of items) {
    const product = productMap[item.product];

    console.log("========== STOCK CHECK ==========");
    console.log("Cart product ID:", item.product);
    console.log("Cart quantity:", item.quantity);
    console.log("Database product:", product);
    console.log("Database stock:", product?.stock);
    console.log("=================================");

    if (!product) {
        return res.status(404).json({
            message: `Product not found: ${item.product}`,
        });
    }

    if ((product.stock ?? 0) < item.quantity) {
        return res.status(400).json({
            message: `Product "${product.name}" has only ${product.stock} units available, but you requested ${item.quantity}.`,
        });
    }
}

    const orderItems = items.map((item: any)=>{
        const dbProduct = productMap[item.product];
        if(!dbProduct) throw new Error(`Product ${item.product} not found`);
        return{
            product: dbProduct.id, name: dbProduct.name, image: dbProduct.image, price: dbProduct.price, quantity: item.quantity, unit: dbProduct.unit,
        }
    })

    const subtotal = orderItems.reduce((sum: number, item: any)=> sum + item.price * item.quantity, 0)
    const isDhaka = shippingAddress.district.trim().toLowerCase() === "dhaka";
    const deliveryFee = subtotal > 899 ? 0 : isDhaka ? 80 : 120;
    const total = Math.round((subtotal + deliveryFee) * 100) / 100;

    const order = await prisma.order.create({
        data: {
            userId: req.user!.id,
            items: orderItems,
            shippingAddress, paymentMethod, subtotal, deliveryFee, total,
            statusHistory: [{status: "Placed", note: "Order placed successfully", timestamp: new Date()}]
        }
    })

    if(paymentMethod === "card"){

        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string) 
        // create session
        const session = await stripe.checkout.sessions.create({
        success_url: `${req.headers.origin}/order?clearCart=true`,
        cancel_url: `${req.headers.origin}/checkout`,
        line_items: [
                {
                    price_data: {
                        currency: "bdt",
                        product_data: {
                            name: "Payment Products",
                        },
                        unit_amount: Math.round(total * 100),
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment', 
            metadata: {orderId: order.id}
        });
        return res.json({url: session.url})
    }

    res.json({order})

    // Decrease stock
    for(const item of orderItems){
        await prisma.product.update({
            where: {id: item.product}, data: {stock: {decrement: item.quantity}}
        })
    }

    // Send stock update events for each product in the order
    for(const item of orderItems){
        await inngest.send({name: "inventory/stock.updated", data: {productId: item.product}})
    }

    await inngest.send({name: "order/placed", data: {orderId: order.id}})
}

// Get user's orders
// Get/ API/ orders
export const getUserOrders = async (req: Request, res: Response)=>{
    const { status } = req.query;

    const where: any = {
        userId: req.user!.id,
        NOT: [{paymentMethod: "card", isPaid: false}] 
    }
    if(status && status !== "All"){
        where.status = status;
    }

    const orders = await prisma.order.findMany({
        where, include: {deliveryPartner: {select: {name: true, phone: true}}}, orderBy: { createdAt: "desc"},
    })
    res.json({orders})
}

// Get single order
// Get/ API/ orders/ :id
export const getOrder = async (req: Request, res: Response)=>{
    const order = await prisma.order.findFirst({
        where: {id: req.params.id as string, userId: req.user!.id},
        include: {deliveryPartner: {select: {name: true, phone: true, 
        avatar: true, vehicleType: true }}}
    })

    if(!order){
        return res.status(404).json({message: "Order not found"});
    }
    res.json({order})
}

// Update order status (admin)
// PUT/ API/ orders/ :id/ status
export const updateOrderStatus = async (req: Request, res: Response)=>{

    const { status, note } = req.body;
    const order = await prisma.order.findUnique({ where: {id: req.params.id as string}})

    if(!order){
        return res.status(404).json({message: "Order not found"});
    }
    
    const history = (Array.isArray(order.statusHistory) ? order.statusHistory : []) as any[];
    history.push({status, note: note || `Order ${status.toLowerCase()}`, timeStamp: new Date()})

    const updateOrder = await prisma.order.update({
        where: {id: req.params.id as string}, data: {status, statusHistory: history}})
    res.json({order: updateOrder})
}

// Get all orders (admin)
// GET/ API/ orders/ all
export const getAllOrders = async (req: Request, res: Response)=>{
    
    const order = await prisma.order.findMany({ where: {NOT: [{paymentMethod: "card", isPaid: false}]},
        include: {
            user: {select: {name: true, email: true}},
            deliveryPartner: {select: {name: true, phone: true, email: true}}
        },
        orderBy: {createdAt: "desc"},
    })
    res.json({order})    
}

// Get Order Location
// GET/ API/ orders/ :id/ Location
export const getOrderLocation = async (req: Request, res: Response)=>{
    
    const order = await prisma.order.findFirst({ where: {id: req.params.id as string, userId: req.user!.id},
        select: {liveLocation: true, status: true}
    })
    
    if(!order) return res.status(404).json({message: " Order not found"});
    res.json({liveLocation: order.liveLocation, status: order.status})
}