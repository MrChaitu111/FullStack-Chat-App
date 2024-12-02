import cloudinary from '../lib/cloudinary.js';
import { generateToken } from '../lib/utilits.js';
import  User from '../models/user.model.js';
import bcrpty from 'bcryptjs';

export const signup = async(req,res)=>{
    const {fullName,email,password} = req.body;
    try {
        if(!fullName || !email || !password){
            return res.status(404).json({message:"All Fields are required..?"});
        }

        if(password.length < 6){
            return res.status(404).json({message:"Password must be least 6 characters "});
        }
        const user = await User.findOne({email});
        
        if (user) return res.status(404).json({message:"Email already exists"});

        const salt = await bcrpty.genSalt(10)
        const hashedPassword = await bcrpty.hash(password,salt) 
        // const salt = await bcrypt.genSalt(10)
        // const hashedPassword = await bcrypt.hash(password, salt)
        // newUser.password = hashedPassword

        const newUser = new User({
            fullName,
            email,
            password:hashedPassword
        })

        if(newUser){
            generateToken(newUser._id,res)
            await newUser.save();

            res.status(202).json({
                _id:newUser._id,
                fullName:newUser.fullName,
                email:newUser.email,
                profilePic:newUser.profilePic,
            });        
        }else{
            res.status(404).json({message:"Invalid User data..?"});
        }
    } catch (error) {
        console.log('Enter in signup controller',error.message);
        res.status(505).json({message:"Internal Server Error"});
    }

}

export const login = async (req, res) => {
    const { email, password } = req.body;
    try{
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isPasswordCorrect = await bcrpty.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    generateToken(user._id, res);

    res.status(200).json({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      profilePic: user.profilePic,
    });
  } catch (error) {
    console.log("Error in login controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const logout =(req,res)=>{
    try {
        res.cookie("jwt", "",{maxAge:0})
        res.status(202).json({message:"Logout is Successfully..!"});
    } catch (error) {
        console.log("Error in Login Controller..?",error,message);
        return res.status(505).json({message:"Internal Server Error..?"});
    }
    

}

export const  updateProfile = async (req,res)=>{
    try {
        const {profilePic} = req.body;
        const userId = req.user._id;

        if(!profilePic){
            return res.status(504).json({message:"Profile pic is Required..?"});
        }
        const uploadResponse = await cloudinary.uploader.upload(profilePic);

        const updatedUser = await User.findByIdAndUpdate(userId, {profilePic:uploadResponse.secure_url}, {new:true});

        res.status(202).json(updatedUser);
        
    } catch (error) {
        console.log("Error in UpdateProfile Controller..?",error,message);
        return res.status(505).json({message:"Internal Server Error..?"});
        
    }
}

export const checkAuth = (req,res)=>{
    try {
        res.status(202).json(req.user);        
    } catch (error) {
        console.log("Error in checkAuth Controller..?",error,message);
        return res.status(505).json({message:"Internal Server Error..?"});
    }
}