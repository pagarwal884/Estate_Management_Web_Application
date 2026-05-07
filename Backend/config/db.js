import mongoose from "mongoose";

export const connectdb = async() => {
    await mongoose.connect("mongodb+srv://pagarwal1145_db_user:tR5xneS04VFTSuHe@cluster0.jikd7iz.mongodb.net/?appName=Cluster0").then(() => {
        console.log("DB Connected")
    })
}