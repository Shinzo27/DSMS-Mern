import User from '../Models/User.js'
import { generateToken, SendOtp } from '../Utils/Auth.js'
import { catchAsyncErrors } from '../Middleware/CatchAsyncError.js'
import ErrorHandler from '../Middleware/ErrorHandler.js'

export const handleLogin = catchAsyncErrors(async(req,res,next)=>{
    const { email, password } = req.body
    if( !email || !password ) return next(new ErrorHandler("Please Enter All Details", 400))

    const user = await User.findOne({
        email,
    })
    if(!user) return next(new ErrorHandler("Invalid Email!", 400))
    
    const isMatchedPass = await user.comparePassword(password)

    if(!isMatchedPass) return next(new ErrorHandler("Invalid Password"))

    generateToken(user, "Login Successful",201, res)
})

export const handleRegister = catchAsyncErrors(async(req,res, next)=>{
    const { username, email, password } = req.body
    if( !username || !email || !password ) return next(new ErrorHandler("Please Enter All Details", 404))
    
    const isRegistered = await User.findOne({email})
    if(isRegistered) return next(new ErrorHandler("User Already Exists With This Email", 400))

    SendOtp(username, email, password, "Otp Sent Successfully On Your Email!", 200, res)
})

export const verifyOtp = catchAsyncErrors(async(req, res, next)=>{
    const { username, email, password, otp, enteredOtp } = req.body;
    if(!enteredOtp) return next(new ErrorHandler("Please Fill Otp", 400))

    if( otp !== enteredOtp ) return next(new ErrorHandler("Otp is Incorrect", 400))
    
    const user = await User.create({
        username,
        email,
        password, 
        role: "Customer"
    })

    generateToken(user, "User Registered", 200, res)
})

export const updatePassword = catchAsyncErrors(async(req,res,next)=>{
    const { oldPassword ,newPassword } = req.body;
    const { email } = req.params;

    if( !oldPassword || !newPassword ) return next(new ErrorHandler("Please Enter All Details", 400))

    const existinguser = await User.findOne({ email })
    if(!existinguser) return next(new ErrorHandler("User not found", 400))
    
    const comparePassword = existinguser.comparePassword(oldPassword)

    if(!comparePassword) return next(new ErrorHandler("Password Doesn't Matched!", 400));
    
    await existinguser.updatePassword(newPassword);
    res.status(201).json({
        success:true,
        message: "Password Updated Successfully"
    })
})

export const resetPassword = catchAsyncErrors(async(req,res,next)=>{
    console.log("resetPassword")
})

export const logoutUser = async(req,res,next)=>{
    const tokenCookie = req.cookies?.CustomerToken
    if(!tokenCookie) return next(new ErrorHandler("User is not Loggedin", 400))
    
    res.status(201).cookie("CustomerToken", "", {
        httpOnly: true,
        expires: new Date(Date.now()),
    })
    .json({
        success: true,
        message: "Customer Logged Out Successfully!"
    })
}

export const logoutAdmin = async(req,res,next)=>{
    const tokenCookie = req.cookies?.AdminToken
    if(!tokenCookie) return next(new ErrorHandler("Admin is not Loggedin", 400))
    
    res.status(201).cookie("AdminToken", "", {
        httpOnly: true,
        expires: new Date(Date.now()),
    })
    .json({
        success: true,
        message: "Admin Logged Out Successfully!"
    })
}