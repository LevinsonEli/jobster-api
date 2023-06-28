if (
  !process.env.NODEMAILER_HOST ||
  !process.env.NODEMAILER_PORT ||
  !process.env.NODEMAILER_USER ||
  !process.env.NODEMAILER_PASSWORD
) {
  console.log(
    'Nodemailer configuration parameters are not provided in the .env. Exiting...'
  );
  process.exit(1);
}

export default {
  nodemailer: {
    host: process.env.NODEMAILER_HOST,
    port: process.env.NODEMAILER_PORT,
    auth: {
      user: process.env.NODEMAILER_USER,
      pass: process.env.NODEMAILER_PASSWORD,
    },
  },
};
