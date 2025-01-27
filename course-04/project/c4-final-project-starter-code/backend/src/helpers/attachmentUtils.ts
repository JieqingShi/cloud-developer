import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
// import * as uuid from 'uuid'

const XAWS = AWSXRay.captureAWS(AWS)

export class AttachmentUtils {
    constructor(
        private readonly s3 = new XAWS.S3({ signatureVersion: 'v4' }),
        private readonly bucketName = process.env.ATTACHMENT_S3_BUCKET,
        private readonly urlExpiration = parseInt(process.env.SIGNED_URL_EXPIRATION)
    ) {}

    async getUploadUrl(attachmentId: string): Promise<string> {
        return await this.s3.getSignedUrl('putObject', {
            Bucket: this.bucketName,
            Key: attachmentId,
            Expires: this.urlExpiration
        })
    }

    async getAttachmentUrl(attachmentId: string): Promise<string> {
        const attachmentUrl = `https://${this.bucketName}.s3.amazonaws.com/${attachmentId}`
        return attachmentUrl
    }
}