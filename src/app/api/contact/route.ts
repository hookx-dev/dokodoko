import { Resend } from "resend";
import { NextResponse } from "next/server";

const resend = new Resend(process.env.RESEND_API_KEY);
const recipientEmail = process.env.CONTACT_RECIPIENT_EMAIL;

export async function POST(request: Request) {
  try {
    const { name, email, subject, message } = await request.json();

    // バリデーション
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: "すべての項目を入力してください" },
        { status: 400 }
      );
    }

    if (!recipientEmail) {
      console.error("CONTACT_RECIPIENT_EMAIL is not set");
      return NextResponse.json(
        { error: "サーバー設定エラーが発生しました" },
        { status: 500 }
      );
    }

    const { error } = await resend.emails.send({
      from: "DokoDoko お問い合わせ <onboarding@resend.dev>",
      to: [recipientEmail],
      replyTo: email,
      subject: `【DokoDoko お問い合わせ】${subject}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
          <h2 style="color: #4f46e5; margin-bottom: 24px;">DokoDoko お問い合わせ</h2>
          
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
            <tr style="background: #f8fafc;">
              <td style="padding: 10px 16px; font-weight: bold; width: 120px; border: 1px solid #e2e8f0;">お名前</td>
              <td style="padding: 10px 16px; border: 1px solid #e2e8f0;">${name}</td>
            </tr>
            <tr>
              <td style="padding: 10px 16px; font-weight: bold; width: 120px; border: 1px solid #e2e8f0;">メール</td>
              <td style="padding: 10px 16px; border: 1px solid #e2e8f0;"><a href="mailto:${email}">${email}</a></td>
            </tr>
            <tr style="background: #f8fafc;">
              <td style="padding: 10px 16px; font-weight: bold; width: 120px; border: 1px solid #e2e8f0;">件名</td>
              <td style="padding: 10px 16px; border: 1px solid #e2e8f0;">${subject}</td>
            </tr>
          </table>

          <div style="border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; background: #f8fafc;">
            <p style="font-weight: bold; margin: 0 0 8px;">お問い合わせ内容</p>
            <p style="margin: 0; white-space: pre-wrap; line-height: 1.7;">${message}</p>
          </div>

          <p style="margin-top: 24px; color: #94a3b8; font-size: 12px;">
            このメールは DokoDoko のお問い合わせフォームから送信されました。<br>
            返信する場合は差出人（${email}）に直接返信してください。
          </p>
        </div>
      `,
    });

    if (error) {
      console.error("Resend error:", error);
      return NextResponse.json(
        { error: "メール送信に失敗しました" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Contact API error:", err);
    return NextResponse.json(
      { error: "予期しないエラーが発生しました" },
      { status: 500 }
    );
  }
}
