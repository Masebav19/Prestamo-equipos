import express from 'express'
import os from 'os'
import env from './controllers/env.js'
import bcript from 'bcrypt'
import cors from 'cors'
import {create_let_device,create_return_device,read_user_credencials,
    read_available_devices,read_loaned_devices
} from './controllers/MysqlClient.js'
import { Send_email } from './controllers/emailClient.js'

const server = express()
server.use(express.json());
server.use(cors());
const venv = env()

// Post de envío de las credenciales de usuario al inicio de la página
server.post('/api/LogIn',async(req,res)=>{
    const data = req.body;
    if (!(data?.User)) return res.json({Login: "NotAllowed"}).status(406)
    const credencials = await read_user_credencials();
    const LogIn = credencials.find((credencial)=>{
        return credencial.Lab_User===data.User && bcript.compareSync(credencial.Lab_Password,data.Password)
    })
    return LogIn ?  res.json({LogIn: "Succesfull"}).status(200): res.json({Login: "NotAllowed"}).status(400)
})
//***************PRESTAMOS*********************************** */
// POST para la recepción de datos del prestamista para la escritura a la base de datos desde el cliente
server.post('/api/prestamo',(req,res)=>{
    const data = req.body; 
    if (!(data?.Nombre && data?.email&&data?.Modelo)) return res.json({Response: "Bad Data"}).status(406)
    create_let_device(data).then(()=>{
        const emailData={
            asunto: `Prestamo del Dispositivo: ${data.Nombre}`,
            msg: `
                Se ha prestado el siguiente equipo:
                Modelo: ${data.Modelo}
                Nombre responsable: ${data.Nombre}
                Correo: ${data.email}
                
                Laboratorio de redes Industriales
                Deparatmaneto de automatización y control
                Escuela Politécnica Nacional
            `,
            for: data.email
        }
        Send_email(emailData.msg,emailData.asunto,emailData.for).finally(()=>{
            return res.json({Response: "Succesfull"}).status(200)
        })
    }).catch((error)=>{
        console.log(error)
        return res.json({Response: "Bad Data"}).status(406)
    })
})
//GET para el envío de datos de los dispositivos que están libres
server.get('/api/prestamo',(req,res)=>{
    read_available_devices().then(devices=>{
        const DevicesNames = devices.map((device)=>{
            return {
                Id: device.Id,
                Modelo: device.Modelo,
                Marca: device.Marca,
                DirIp: device.Especificaciones
            }
        })
        return res.json(DevicesNames).status(200)
    }).catch(()=>{
        return res.json({Response: "Bad Data"}).status(406)
    })
})
//***********DEVOLUCIÓN DE EQUIPOS***************************** */
//POST para la recepción de datos del prestamista para la escritura en la base de datos
server.post('/api/devolucion',(req,res)=>{
    const data = req.body; 
    if (!(data?.email&&data?.Modelo)) return res.json({Response: "Bad Data"}).status(406)
    create_return_device(data).then(()=>{
        const emailData={
            asunto: `Devolución del Dispositivo`,
            msg: `
                Se ha devuelto el siguiente equipo:
                Modelo: ${data.Modelo}
                Correo: ${data.email}
                
                Laboratorio de redes Industriales
                Deparatmaneto de automatización y control
                Escuela Politécnica Nacional
            `,
            for: `${data.email};${data.DocenteResponsable}`
        }
        Send_email(emailData.msg,emailData.asunto,emailData.for).finally(()=>{
            return res.json({Response: "Succesfull"}).status(200)
        })
    }).catch(()=>{
        return res.json({Response: "Bad Data"}).status(406)
    })
})
//GET para envío de los dispositivos prestados

server.get('/api/devolucion',(req,res)=>{
    read_loaned_devices().then((loanedDevices)=>{
        const filterDevices = loanedDevices.map((loanedDevice)=>{
            return{
                email: loanedDevice.email,
                Modelo: loanedDevice.Modelo
            }
        })
        return res.json(filterDevices).status(200)
    }).catch(()=>{
        return res.json({Response: "Bad Data"}).status(406)
    })
})
// server.post('api/detalle',(req,res)=>{

// })
// server.post('api/mantenimiento',(req,res)=>{

// })
server.listen(venv.SERVER_PORT,()=>{
    console.log(`Servidor escuchando en el puerto ${venv.SERVER_PORT}`)
    console.log(`Direccion IP: ${os.networkInterfaces().Ethernet[3].address}:${venv.SERVER_PORT}`)
})