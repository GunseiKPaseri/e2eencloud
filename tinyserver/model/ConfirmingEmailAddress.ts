import { prisma } from '../dbclient.ts';
import { sendMail } from '../mailclient.ts';

export class ConfirmingEmailAddress {
  readonly email: string;
  readonly email_confirmation_token: string;
  readonly expired_at: Date;
  constructor(
    email: string,
    email_confirmation_token: string,
    expired_at: Date,
  ) {
    this.email = email;
    this.email_confirmation_token = email_confirmation_token;
    this.expired_at = expired_at;
  }
}

export const addEmailConfirmation = async (
  email: string,
  email_confirmation_token: string,
) => {
  // 一時間後に無効化
  const expired_at = new Date(Date.now());
  expired_at.setHours(expired_at.getHours() + 1);
  await Promise.all([
    //
    await prisma.confirmingEmailAddress.create({
      data: {
        email: email,
        token: email_confirmation_token,
        expired_at: expired_at,
      },
    }),
    // メール送信
    await sendMail({
      to: email,
      subject: 'confirm address',
      content: `/${email_confirmation_token}`,
      html: `<a href='/${email_confirmation_token}'>confirm mail address</a>`,
    }),
  ]);

  const newEmailConfirmation = new ConfirmingEmailAddress(
    email,
    email_confirmation_token,
    expired_at,
  );
  return newEmailConfirmation;
};

export const isEmailConfirmSuccess = async (
  email: string,
  email_confirmation_token: string,
) => {
  const emailConfirms = await prisma.confirmingEmailAddress.count({
    where: {
      email: email,
      token: email_confirmation_token,
      expired_at: {
        gt: new Date(Date.now()),
      },
    },
  });
  return emailConfirms > 0;
};

export const deleteEmailConfirms = async (email: string) => {
  await prisma.confirmingEmailAddress.deleteMany({
    where: {
      email: email,
    },
  });
};
