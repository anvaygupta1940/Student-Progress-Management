import nodemailer from 'nodemailer';
import Student from '../models/Student.js';

// Create email transporter
const createTransporter = () => {
  return nodemailer.createTransporter({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
};

// Send inactivity reminder email
export const sendInactivityReminder = async (student) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: student.email,
      subject: 'Stay Active on Codeforces! 🚀',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px; text-align: center; color: white;">
            <h1 style="margin: 0; font-size: 28px;">🎯 Keep Your Coding Streak Alive!</h1>
          </div>
          
          <div style="background: #f8f9fa; padding: 30px; border-radius: 10px; margin-top: 20px;">
            <p style="font-size: 18px; margin-bottom: 20px;">Hi <strong>${student.name}</strong>,</p>
            
            <p style="font-size: 16px; line-height: 1.6; color: #333;">
              We noticed you haven't submitted any problems on Codeforces lately. 
              Don't let your coding skills get rusty! 💪
            </p>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea;">
              <h3 style="margin-top: 0; color: #667eea;">📊 Your Stats:</h3>
              <p><strong>Current Rating:</strong> ${student.currentRating}</p>
              <p><strong>Max Rating:</strong> ${student.maxRating}</p>
              <p><strong>Codeforces Handle:</strong> ${student.codeforcesHandle}</p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="https://codeforces.com/profile/${student.codeforcesHandle}" 
                 style="background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
                Visit Your Profile 🔗
              </a>
            </div>
            
            <p style="font-size: 16px; line-height: 1.6; color: #333;">
              Remember, consistent practice is the key to improvement. Even solving one problem a day can make a huge difference! 🌟
            </p>
            
            <div style="background: #e3f2fd; padding: 15px; border-radius: 5px; margin-top: 20px;">
              <p style="margin: 0; font-size: 14px; color: #1976d2;">
                💡 <strong>Tip:</strong> Try solving problems slightly below your current rating to build confidence, then gradually increase the difficulty.
              </p>
            </div>
          </div>
          
          <div style="text-align: center; margin-top: 30px; padding: 20px; color: #666; font-size: 14px;">
            <p>Happy Coding! 🚀</p>
            <p>This is an automated reminder. You can disable these emails by contacting your administrator.</p>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);

    // Update reminder count
    await Student.findByIdAndUpdate(student._id, {
      $inc: { reminderCount: 1 }
    });

    console.log(`📧 Reminder email sent to ${student.email}`);

    return true;
  } catch (error) {
    console.error(`❌ Failed to send email to ${student.email}:`, error.message);
    return false;
  }
};

// Check for inactive students and send reminders
export const checkInactiveStudents = async () => {
  try {

    // finding the 7days ago date
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const inactiveStudents = await Student.find({
      isActive: true,
      autoEmailEnabled: true,
      $or: [
        { lastSubmissionDate: { $lt: sevenDaysAgo } },
        { lastSubmissionDate: null }
      ]
    });

    console.log(`📧 Found ${inactiveStudents.length} inactive students`);

    let emailsSent = 0;

    for (const student of inactiveStudents) {
      try {
        const success = await sendInactivityReminder(student);
        if (success) emailsSent++;

        // Add delay between emails
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (error) {
        console.error(`Failed to send reminder to ${student.email}:`, error.message);
      }
    }

    console.log(`✅ Sent ${emailsSent} reminder emails`);

    return {
      totalInactive: inactiveStudents.length,
      emailsSent
    };
  } catch (error) {
    console.error('Error checking inactive students:', error);
    throw error;
  }
};

// Test email configuration
export const testEmailConfig = async () => {
  try {
    const transporter = createTransporter();
    await transporter.verify();
    console.log('✅ Email configuration is valid');
    return true;
  } catch (error) {
    console.error('❌ Email configuration error:', error.message);
    return false;
  }
};