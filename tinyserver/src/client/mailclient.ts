import { ENV, SMTPClient } from 'tinyserver/deps.ts';

const mailcli = new SMTPClient({
  debug: {
    allowUnsecure: true,
  },
  connection: {
    hostname: 'mailer',
    port: 1025,
    auth: {
      username: ENV.SMTP_USER,
      password: ENV.SMTP_PASSWORD,
    },
  },
});

export const sendMail = async (
  params: { to: string; fromInfo?: string; subject: string; content: string; html: string },
) => {
  const to = params.to;
  const from = `${params.fromInfo ?? 'noreply'}@${
    ENV.SERVER_HOSTNAME === 'localhost' ? 'example.com' : ENV.SERVER_HOSTNAME
  }`;
  await mailcli.send({
    from,
    to,
    subject: params.subject,
    content: params.content,
    html: params.html,
  });
};
