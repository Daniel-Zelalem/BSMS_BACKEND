const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const BrokercompaniesSchema = new Schema({

    companyName:{
        type: String,
        required:[true,"Type is required!"]
    },
    companyAddress:{
        type:String,
        required:[true,"CompanyAddress is required!"]
    },
    companyContactNumber:{
        type:String,
        required:[true,"Phone number is required"]

    },
    companyEmail:{
        type:String,
        required:[true,"ComapnyEmail is required"]
    }
},
{timestamps:true})

const Brokercompanies = mongoose.model('BrokerCompanies',BrokercompaniesSchema)
module.exports = Brokercompanies