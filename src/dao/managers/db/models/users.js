import mongoose from 'mongoose';

const collection = 'users';

const schema = new mongoose.Schema({
    first_name: String,
    last_name: String,
    email:{
        type: String,
        unique: true,
        required: true
    },
    age:Number,
    password: {type: String, required:true},
    role: {
        type: String,
        default: 'user',
        enum: ['user','premium', 'admin'],
    },
    pfp: String,
    gender: String,
    last_connection: String,
    wishlist: {
        type: [
          {
            product: {
              type: mongoose.Schema.Types.ObjectId,
              ref: "products",
            }
          },
        ],
        default: [],
      },
    documents: [
        {
            document: {
                name: {
                    type: String
                },
                reference: {
                    type: String
                }
            }
        }
    ]
})

export const userModel = mongoose.model(collection,schema);

