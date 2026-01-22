// import { Injectable, Logger } from '@nestjs/common';
// import axios from 'axios';
// import * as fs from 'fs';
// import * as path from 'path';
// import * as handlebars from 'handlebars';

// interface IMailContext {
//   name: string;
//   activationCode?: string | number;
//   otpCode?: string | number;
//   expiresAtFormatted: string;
// }

// @Injectable()
// export class MailService {
//   private readonly logger = new Logger(MailService.name);
//   // URL API của bạn
//   private readonly EXTERNAL_MAIL_API =
//     'https://qlcm.bvtwhue.com.vn:443/emr-tw/api/v1/email/send';

//   async sendMail(options: {
//     to: string;
//     subject: string;
//     template: string;
//     context: IMailContext;
//   }) {
//     const { to, subject, template, context } = options;
//     const metadata = JSON.stringify(context);

//     // const templateFileName = template.endsWith('.hbs')
//     //   ? template
//     //   : `${template}.hbs`;
//     // const templatePath = path.join(
//     //   process.cwd(),
//     //   'dist',
//     //   'src',
//     //   'mail',
//     //   'templates',
//     //   templateFileName,
//     // );

//     try {
//       // if (!fs.existsSync(templatePath)) {
//       //   throw new Error(`Template not found at ${templatePath}`);
//       // }

//       // const templateSource = fs.readFileSync(templatePath, 'utf8');
//       // const compiledTemplate = handlebars.compile(templateSource);
//       // const htmlContent = compiledTemplate(context);
//       // console.log('htmlContent: ', htmlContent);
//       console.log('context: ', context);
//       const response = await axios.post(
//         this.EXTERNAL_MAIL_API,
//         {},
//         {
//           params: {
//             email: to,
//             template: template,
//             subject: subject,
//             metadata: metadata,
//           },
//           headers: {
//             accept: '*/*',
//           },
//         },
//       );
//       this.logger.log(`Email sent successfully to ${to} via External API`);
//       return response.data;
//     } catch (error) {
//       this.logger.error(
//         'External Mail API Error:',
//         error.response?.data || error.message,
//       );
//       throw error;
//     }
//   }
// }

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend'; //
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
  private readonly resend: Resend;

  constructor(private configService: ConfigService) {
    this.resend = new Resend(this.configService.get<string>('RESEND_API_KEY')); //
  }

  async sendMail(options: {
    to: string;
    subject: string;
    template: string;
    context: IMailContext;
  }) {
    const { to, subject, template, context } = options;

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

      const templateSource = fs.readFileSync(templatePath, 'utf8');
      const compiledTemplate = handlebars.compile(templateSource);
      const htmlContent = compiledTemplate(context);

      // Gửi email qua Resend API
      const { data, error } = await this.resend.emails.send({
        from: 'LearnifyX <onboarding@resend.dev>',
        to: [to],
        subject: subject,
        html: htmlContent,
      });

      if (error) {
        // eslint-disable-next-line @typescript-eslint/only-throw-error
        throw error;
      }
      console.log('context: ', context);

      this.logger.log(`Email sent successfully to ${to} via Resend`);
      return data;
    } catch (error) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      this.logger.error(' Resend API Error:', error.message || error);
      throw error;
    }
  }
}
