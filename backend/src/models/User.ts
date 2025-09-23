import { Schema, model, Document } from 'mongoose';

// Define the interface for the User document
export interface IUser extends Document {
  name?: string;
  email: string;
  password?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Define the User schema
const UserSchema = new Schema<IUser>({
  name: {
    type: String,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
},
{
  timestamps: true, // Automatically add createdAt and updatedAt fields
});

const User = model<IUser>('User', UserSchema);

export default User;
