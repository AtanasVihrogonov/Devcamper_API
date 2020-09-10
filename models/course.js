const  mongoose = require('mongoose');

const CourseSchema = new mongoose.Schema({
  title: {
    type: String,
    trim: true,
    required: [true, 'Please add a ciurse title']
  },
  description: {
    type: String,
    required: [true, 'Please add a description']
  },
  weeks: {
    type: String,
    required: [true, 'Please add number of weeks']
  },
  tuition: {
    type: Number,
    required: [true, 'Please add a tuition cost']
  },
  minimumSkill: {
    type: String,
    required: [true, 'Please add a minimum skill'],
    enum: ['beginner', 'intermediate', 'advanced']
  },
  scholarshipAvailable: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  bootcamp: {
    type: mongoose.Schema.ObjectId,
    ref: 'Bootcamp',
    required: true
  }
});

// Static method to get avg of course tuitions
CourseSchema.statics.getAvaregeCost = async function(bootcampId) {
  console.log('Calculating avg cost...'.blue);

  const obj = await this.aggregate([
    {
      $match: { bootcamp: bootcampId }
    },
    {
      $group: {
        _id: '$bootcamp',
        avarageCost: { $avg: '$tuition' }
      }
    }
  ]);

  try {
    await this.model('Bootcamp').findByIdAndUpdate(bootcampId, {
      avarageCost: Math.ceil(obj[0].avarageCost / 10) * 10
    });
  } catch (err) {
    console.error(err);
  }
}

// Call getAvarageCost after save
CourseSchema.post('save', function() {
  this.constructor.getAvaregeCost(this.bootcamp);
});

// Call getAvarageCost before remove
CourseSchema.pre('remove', function() {
  this.constructor.getAvaregeCost(this.bootcamp);
});

module.exports = mongoose.model('Course', CourseSchema);