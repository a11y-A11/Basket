import { Request, Response } from "express";
import { prisma } from "../config/prisma.js";

// Get user addresses
// Get/ API/ addresses
export const getAddresses = async (req: Request, res: Response)=> {
    const addresses = await prisma.address.findMany({
        where: {userId: req.user!.id},
        orderBy: {createdAt: "asc"}
    })
    res.json({addresses})
}
{/*}
// Add address
// POST/ API/ addresses
export const addAddress = async (req: Request, res: Response)=>{
    const {label, address, city, district, zip, isDefault, lat, lng} = req.body;

    // Require coordinates
    if(lat == null || lng == null){
        return res.status(400).json({message: "Location coordinates are required. Please allow location access."});
    }

    const currentAddresses = await prisma.address.findMany({
        where: {userId: req.user!.id}
    })

    let makeDefault = isDefault;
    if(currentAddresses.length === 0) makeDefault = true;

    if(makeDefault){
        await prisma.address.updateMany({
            where: {userId: req.user!.id},
            data: {isDefault: false}
        })
    }

    await prisma.address.create({
        data: {
            userId: req.user!.id, label, address, city, district, zip, isDefault: makeDefault, lat: Number(lat), lng: Number(lng)
        }
    })

    const addresses = await prisma.address.findMany({
        where: {userId: req.user!.id},
        orderBy: {createdAt: "asc"}
    })
    res.status(201).json({addAddress})
} */}
export const addAddress = async (req: Request, res: Response) => {
  try {
    const {
      label,
      address,
      city,
      district,
      zip,
      isDefault,
      lat,
      lng,
    } = req.body;

    console.log("========== ADD ADDRESS ==========");
    console.log("BODY:", req.body);
    console.log("USER:", req.user);

    if (!req.user?.id) {
      return res.status(401).json({
        message: "User not authenticated",
      });
    }

    if (lat == null || lng == null) {
      return res.status(400).json({
        message:
          "Location coordinates are required. Please allow location access.",
      });
    }

    const userId = req.user.id;

    const currentAddresses = await prisma.address.findMany({
      where: {
        userId,
      },
    });

    let makeDefault = Boolean(isDefault);

    if (currentAddresses.length === 0) {
      makeDefault = true;
    }

    if (makeDefault) {
      await prisma.address.updateMany({
        where: {
          userId,
        },
        data: {
          isDefault: false,
        },
      });
    }

    const newAddress = await prisma.address.create({
      data: {
        userId,
        label,
        address,
        city,
        district,
        zip,
        isDefault: makeDefault,
        lat: Number(lat),
        lng: Number(lng),
      },
    });

    console.log("ADDRESS CREATED:", newAddress);

    const addresses = await prisma.address.findMany({
      where: {
        userId,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    return res.status(201).json({
      message: "Address added successfully",
      address: newAddress,
      addresses,
    });
  } catch (error: any) {
    console.error("ADD ADDRESS ERROR:", error);

    return res.status(500).json({
      message: error.message || "Failed to add address",
    });
  }
};

// Update address
// PUT/ API/ addresses/ :id
export const updateAddress = async (req: Request, res: Response)=> {
    const {label, address, city, district, zip, isDefault, lat, lng} = req.body;

    // Require coordinates
    if(lat == null || lng == null){
        return res.status(400).json({message: "Location coordinates are required. Please allow location access."});
    }

    if(isDefault){
        await prisma.address.updateMany({
            where: {userId: req.user!.id},
            data: {isDefault: false}
        })
    }

    const data: any = {};
    if(label) data.label = label;
    if(address) data.address = address;
    if(city) data.city = city;
    if(district) data.district = district;
    if(zip) data.zip = zip;
    if(isDefault !== undefined) data.isDefault = isDefault;
    if(lat != null) data.lat = Number(lat);
    if(lng != null) data.lng = Number(lng);

    try {
        await prisma.address.update({
            where: {id: req.params.id as string},
            data,
        })
    } catch (err) {
        return res.status(404).json({message: "Address not found"});
    }

    const addresses = await prisma.address.findMany({
        where: {userId: req.user!.id},
        orderBy: { createdAt: "asc"}
    })
    res.json({addresses})
}

// Delete address
// Delete/ API/ addresses/ :id
export const deleteAddress = async (req: Request, res: Response)=> {
    try {
        await prisma.address.delete({where: {id: req.params.id as string}})
    } catch (err : any) {
        console.log(err.message)
    }

        const addresses = await prisma.address.findMany({
            where: { userId: req.user!.id},
            orderBy: { createdAt: "asc"}
        })
        res.json({addresses})
}