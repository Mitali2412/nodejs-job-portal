import mongoose from 'mongoose';
import validator from 'validator';
import bcrypt from 'bcryptjs';
import JWT from 'jsonwebtoken';
//creating schema
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is rquired '],
    },
    lastname: {
        type: String,

    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,//so that onlt 1 user a/c is created by 1 email
        validate: validator.isEmail,
        select: true
    },
    password: {
        type: String,
        require: [true, 'Password is required'],

    },
    location: {
        type: String,
        default: 'India',
    },

},
    { timestamps: true });
//middleware
userSchema.pre('save', async function () {
    if (!this.isModified) return;
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

//compare password
userSchema.methods.comparePassword = async function (userPassword) {
    const isMatch = await bcrypt.compare(userPassword, this.password);
    return isMatch;
}

//JSON WEBTOKEN
userSchema.methods.createJWT = function () {
    return JWT.sign({ userId: this._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
}
export default mongoose.model("User", userSchema);