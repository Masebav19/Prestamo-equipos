import { PrismaClient } from "@prisma/client";

const Prisma = new PrismaClient()

async function create_let_device(data){
    const data_device = await Prisma.devicelist.findFirst({where:{
        Modelo: data.Modelo,
        Especificaciones: data.Especificaciones
    }})

    await Prisma.prestamo_equipos.create({data:{
        Nombre:data.Nombre,
        email: data.email,
        Modelo: data.Modelo,
        Direccion_IP: data?.Direccion_IP,
        ModulosExpansion: data.ModulosExpansion,
        Estado: 'Sin definir',
        Estado_prestamo: "Prestado",
        deviceID: data_device.Id
    }})

    await Prisma.devicelist.update({where:{
        Id: data_device.Id
    },data:{
        Cantidad:{decrement:1} 
    }})
    Prisma.$disconnect

}

async function create_return_device(data){
    const device_data = await Prisma.prestamo_equipos.findFirst({where:{
        email: data.email,
        Modelo: data.Modelo,
        Estado_prestamo: "Prestado"
    }})
    await Prisma.prestamo_equipos.update({where:{
        Prestamos_Id: device_data.Prestamos_Id
    },data:{
        Estado_prestamo: "Devuelto",
        Observacion: data.Observacion,
        DocenteResponsable: data.DocenteResponsable,
        Estado: data.Estado
    }})

    await Prisma.devicelist.update({where:{
        Id: device_data.deviceID
    },data:{
        Cantidad:{
            increment:1
        }
    }})
    Prisma.$disconnect
}

async function read_user_credencials(){
    const credencials = await Prisma.labuser.findMany()
    Prisma.$disconnect
    return credencials;
}

async function read_available_devices(){
    const availableDevices = await Prisma.devicelist.findMany({where:{
        Cantidad:{gt:0}
    }});
    Prisma.$disconnect
    return availableDevices
}

async function read_loaned_devices(){
    const loanedDevices = await Prisma.prestamo_equipos.findMany({where:{
        Estado_prestamo: "Prestado"
    }})
    Prisma.$disconnect
    return loanedDevices
}

// async function delete_let_device(){
//     await Prisma.prestamo_equipos.delete({where:{
//         Prestamos_Id:4
//     }})
//     await Prisma.$disconnect
// }

// delete_let_device().then(console.log("Archivo borrado"))

export {create_let_device,create_return_device,read_user_credencials,read_available_devices,read_loaned_devices}