import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';
import * as handlebars from 'handlebars';

interface IMailContext {
  name: string;
  activationCode?: string | number;
  otpCode?: string | number;
  expiresAtFormatted: string;
}

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  // URL API của bạn
  private readonly EXTERNAL_MAIL_API =
    'https://qlcm.bvtwhue.com.vn:443/emr-tw/api/v1/email/send';

  async sendMail(options: {
    to: string;
    subject: string;
    template: string;
    context: IMailContext;
  }) {
    const { to, subject, template, context } = options;

    // 1. Xử lý đường dẫn Template
    const templateFileName = template.endsWith('.hbs')
      ? template
      : `${template}.hbs`;
    const templatePath = path.join(
      process.cwd(),
      'dist',
      'src',
      'mail',
      'templates',
      templateFileName,
    );

    try {
      if (!fs.existsSync(templatePath)) {
        throw new Error(`Template not found at ${templatePath}`);
      }

      // 2. Render HTML từ Template
      const templateSource = fs.readFileSync(templatePath, 'utf8');
      const compiledTemplate = handlebars.compile(templateSource);
      const htmlContent = compiledTemplate(context);

      // 3. Gọi API qua HTTPS (Port 443)
      // Theo cấu trúc curl của bạn: các tham số nằm trên Query String
      const response = await axios.post(
        this.EXTERNAL_MAIL_API,
        {}, // Body trống theo mẫu -d ""
        {
          params: {
            email: to,
            subject: subject,
            content: htmlContent, // Nội dung HTML đã render
          },
          headers: {
            accept: '*/*',
          },
        },
      );
      console.log('res: ', response);
      this.logger.log(`✅ Email sent successfully to ${to} via External API`);
      return response.data;
    } catch (error) {
      this.logger.error(
        '❌ External Mail API Error:',
        error.response?.data || error.message,
      );
      throw error;
    }
  }
}
