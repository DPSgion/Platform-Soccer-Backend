const os = require("oci-objectstorage");
const common = require("oci-common");

const rawBase64Key = process.env.OCI_PRIVATE_KEY || "";
const formattedPrivateKey = Buffer.from(rawBase64Key, 'base64').toString('utf-8');

const provider = new common.SimpleAuthenticationDetailsProvider(
    process.env.OCI_TENANCY,
    process.env.OCI_USER,
    process.env.OCI_FINGERPRINT,
    formattedPrivateKey,
    null, // Passphrase của private key
    common.Region.fromRegionId(process.env.OCI_REGION || 'ap-singapore-1')
);

// const client = new os.ObjectStorageClient({ authenticationDetailsProvider: provider });

const uploadFileToOCI = async (file) => {
    const namespace = 'axqv9e1of21u';
    const bucket = 'soccer_storage';
    const region = process.env.OCI_REGION || 'ap-singapore-1'; 
    const objectName = `avatars/${Date.now()}-${file.originalname}`;

    const putObjectRequest = {
        namespaceName: namespace,
        bucketName: bucket,
        putObjectBody: file.buffer,
        objectName: objectName,
        contentType: file.mimetype
    };

    try {
        await client.putObject(putObjectRequest);

        return `https://objectstorage.${region}.oraclecloud.com/n/${namespace}/b/${bucket}/o/${encodeURIComponent(objectName)}`;
    } catch (error) {
        console.error("Lỗi Oracle Cloud chi tiết:", error);
        throw new Error("Không thể upload ảnh lên Cloud");
    }
};

module.exports = { uploadFileToOCI };
