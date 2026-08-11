import express from "express";
import { cancelDelivery, completeDelivery, getMyDeliveries, getMyDeliveryDetail, loginPartner, updateDeliveryStatus, updateLocation } from "../controllers/deliveryPartnerController.js";
import deliveryAuth from "../middleware/deliveryAuth.js";

const deliveryPartnerRouter = express.Router();

deliveryPartnerRouter.post('/login', loginPartner)
deliveryPartnerRouter.get('/my-delivery', deliveryAuth, getMyDeliveries)
deliveryPartnerRouter.get('/my-delivery/:id', deliveryAuth, getMyDeliveryDetail)
deliveryPartnerRouter.put('/my-delivery/:id/complete', deliveryAuth, completeDelivery)
deliveryPartnerRouter.put('/my-delivery/:id/cancel', deliveryAuth, cancelDelivery)
deliveryPartnerRouter.put('/my-delivery/:id/status', deliveryAuth, updateDeliveryStatus)
deliveryPartnerRouter.put('/my-delivery/:id/location', deliveryAuth, updateLocation)

export default deliveryPartnerRouter;