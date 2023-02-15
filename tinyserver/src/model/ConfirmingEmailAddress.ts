import { type DBConfirmingEmailAddress, type DBUser, prisma } from 'tinyserver/src/client/dbclient.ts';
import { sendMail } from 'tinyserver/src/client/mailclient.ts';
import { bcrypt, compareAsc, SERVER_EMAIL_CONFIRM_URI } from 'tinyserver/deps.ts';
import { uniqueKey, uniqueSequentialKey } from 'tinyserver/src/utils/uniqueKey.ts';

export class ConfirmingEmailAddress {
  readonly id: string;
  readonly email: string;
  readonly hashedtoken: string;
  readonly expired_at: Date;
  readonly user_id: string | null;
  constructor(params: DBConfirmingEmailAddress) {
    this.id = params.id;
    this.email = params.email;
    this.hashedtoken = params.hashedtoken;
    this.expired_at = params.expired_at;
    this.user_id = params.user_id;
  }
}

export const addEmailConfirmation = async (
  email: string,
) => {
  // 一時間後に無効化
  const expired_at = new Date(Date.now());
  expired_at.setHours(expired_at.getHours() + 1);
  // トークン生成
  const id = uniqueSequentialKey();
  const token = uniqueKey();
  const hashedToken = bcrypt.hash(token);

  const confirmURLBuilder = new URL(SERVER_EMAIL_CONFIRM_URI);
  confirmURLBuilder.searchParams.append('token', `${id}:${token}`);
  confirmURLBuilder.searchParams.append('expired_at', expired_at.toJSON());
  const confirmURL = confirmURLBuilder.toString();
  await Promise.all([
    //
    await prisma.confirmingEmailAddress.create({
      data: {
        id,
        email: email,
        hashedtoken: await hashedToken,
        expired_at: expired_at,
        user_id: null,
      },
    }),
    // メール送信
    await sendMail({
      to: email,
      subject: 'confirm address',
      content: `access to ${confirmURL}`,
      html: `<a href='${confirmURL}'>confirm mail address</a>`,
    }),
  ]);

  return { id, token };
};

export const confirmEmail = async (
  id: string,
  token: string,
): Promise<{ success: true; email: string; user: DBUser | null } | { success: false }> => {
  const emailConfirms = await prisma.confirmingEmailAddress.findUnique({
    select: {
      email: true,
      hashedtoken: true,
      expired_at: true,
      user: true,
    },
    where: {
      id,
    },
  });
  if (
    emailConfirms !== null && compareAsc(new Date(Date.now()), emailConfirms.expired_at) <= 0 &&
    await bcrypt.compare(token, emailConfirms.hashedtoken)
  ) {
    return { success: true, email: emailConfirms.email, user: emailConfirms.user };
  }
  return { success: false };
};

export const deleteEmailConfirms = async (email: string) => {
  await prisma.confirmingEmailAddress.deleteMany({
    where: {
      email: email,
    },
  });
};
