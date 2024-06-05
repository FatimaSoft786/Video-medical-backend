const otpGenerator = require("otp-generator");
const generateOtp = () =>{
    const OTP = otpGenerator.generate(6,{
        upperCaseAlphabets: false,
        specialChars: false,
        digits: true
    });
    return OTP;
};
module.exports = generateOtp;