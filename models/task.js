const mongoose = require('mongoose');
const User = require('./user');
const Schema = mongoose.Schema;

const TaskSchema = new Schema({
    text:{
        type:String,
        required:true
    },
    priority:{
        type:String,
        required:true
    },
    status:{
        type:String,
        enum:['done', 'notDone']
    },
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    }
})

module.exports = mongoose.model('Task', TaskSchema);