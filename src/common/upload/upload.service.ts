import { DeleteObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class UploadService {
  private readonly s3: S3Client;
  private readonly bucket: string;
  private readonly s3Url: string;
  private readonly logger = new Logger(UploadService.name);

  constructor(private readonly config: ConfigService) {
    this.s3 = new S3Client({
      region: config.get<string>('aws.region'),
      credentials: {
        accessKeyId:     config.get<string>('aws.accessKeyId') || '',
        secretAccessKey: config.get<string>('aws.secretAccessKey') || '',
      },
    });
    this.bucket = config.get<string>('aws.bucket') || '';
    this.s3Url  = config.get<string>('aws.s3Url') || '';
  }


  async uploadFile(
    file: Express.Multer.File,
    folder: string = 'general',   // vd: 'categories', 'products', 'avatars'
  ): Promise<string> {
    const ext      = file.originalname.split('.').pop();
    const filename = `${folder}/${uuidv4()}.${ext}`;

    await this.s3.send(
      new PutObjectCommand({
        Bucket:      this.bucket,
        Key:         filename,
        Body:        file.buffer,
        ContentType: file.mimetype,
      }),
    );

    const url = `${this.s3Url}/${filename}`;
    this.logger.log(`Uploaded: ${url}`);
    return url;
  }
  
  async deleteFile(fileUrl: string): Promise<void> {
    // Extract key from URL: https://bucket.s3.region.amazonaws.com/categories/xxx.jpg
    const key = fileUrl.replace(`${this.s3Url}/`, '');

    await this.s3.send(
      new DeleteObjectCommand({
        Bucket: this.bucket,
        Key:    key,
      }),
    );

    this.logger.log(`Deleted: ${key}`);
  }

  async replaceFile(
    oldUrl:  string | null,
    newFile: Express.Multer.File,
    folder:  string,
  ): Promise<string> {
    if (oldUrl) {
      await this.deleteFile(oldUrl).catch(() => {
      });
    }
    return this.uploadFile(newFile, folder);
  }
  
}