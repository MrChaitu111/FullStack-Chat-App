import User from "../models/user.model.js";
import Message from "../models/message.model.js";
import cloudinary from "../lib/cloudinary.js";
import { getReceiverSocketId, io } from "../lib/socket.js";

export const  getUsersFromSiderbar = async(req,res)=>{
    try {
        const loggedInUserId = req.user._id;
        const filteredUsers = await User.find({_id: {$ne:loggedInUserId}}).select("-password");

        res.status(202).json(filteredUsers);
    } catch (error) {
        console.log("Error in getUsersFromSiderbar Controller..?",error,message);
        return res.status(505).json({message:"Internal Server Error..?"});
    }
};

export const getMessages = async(req,res)=>{
    try {
        const { id:userToChatId } = req.params;
        const myId = req.user._id;

        const messages = await Message.find({
            $or:[
                {senderId:myId,receiverId:userToChatId},
                {senderId:userToChatId,receiverId:myId}
            ],
        });

        res.status(202).json(messages);
    } catch (error) {
        console.log("Error in getMessages Controller..?",error,message);
        return res.status(505).json({message:"Internal Server Error..?"});
        
    }
}

export const sendMessage = async (req,res)=>{
    try {
        const { text, image } = req.body;
        const { id: receiverId } = req.params;
        const senderId = req.user._id;

        let imageUrl;

    if(image){
        //iamge upload base64  cloudinary 
        const uploadResponse = await cloudinary.uploader.upload(image);
        imageUrl = uploadResponse.secure_url;
    }

    const newMessage = new Message({
        senderId,
        receiverId,
        text,
        image:imageUrl,
    });
    await newMessage.save();
    
    //socket.io
    const recevierSoketId = getReceiverSocketId(receiverId);
    if(recevierSoketId){
        io.to(recevierSoketId).emit("newMessage",newMessage);
    }

    res.status(202).json(newMessage);

    } catch (error) {
        console.log("Error in sendMessage Controller..?",error,message);
        return res.status(505).json({message:"Internal Server Error..?"});      
    }
}