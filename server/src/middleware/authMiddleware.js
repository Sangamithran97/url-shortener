import jwt from 'jsonwebtoken'

const protect = (req, res, next) =>{
    try{
        const token= req.header.authorization?.split(' ')[1]

        if(!token){
            return res.status(401).json({message: 'No token, access denied '})
        }

        const decoded= jwt.verify(token, process.env.JWT_SECRET)
        req.userId= decoded.userId
        next()
    } catch(error){
        res.status(401).json({message: 'Invalid Token'})
    }
}

export default protect