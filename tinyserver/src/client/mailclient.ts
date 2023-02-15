import { SERVER_HOSTNAME, SMTPClient } from 'tinyserver/deps.ts';

const mailcli = new SMTPClient({
  debug: {
    allowUnsecure: true,
  },
  connection: {
    hostname: 'mailer',
    port: 1025,
    auth: {
      username: 'e2eencloudserver',
      password: 'HBS3WKVmlzZqTFlkujTttHRWh',
    },
  },
});

export const sendMail = async (
  params: { to: string; fromInfo?: string; subject: string; content: string; html: string },
) => {
  const to = params.to;
  const from = `${params.fromInfo ?? 'noreply'}@${SERVER_HOSTNAME === 'localhost' ? 'example.com' : SERVER_HOSTNAME}`;
  await mailcli.send({
    from,
    to,
    subject: params.subject,
    content: params.content,
    html: params.html,
  });
};
