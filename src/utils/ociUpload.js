const os = require("oci-objectstorage");
const common = require("oci-common");
const path = require("path");

const configurationFilePath = path.join(process.cwd(), "src", "config", "oci", "config");
console.log("Đang tải OCI Config từ:", configurationFilePath);

const provider = new common.ConfigFileAuthenticationDetailsProvider(
    configurationFilePath,
    "DEFAULT"
);

const client = new os.ObjectStorageClient({ authenticationDetailsProvider: provider });

const uploadFileToOCI = async (file) => {
    const namespace = 'axqv9e1of21u';
    const bucket = 'soccer_storage';
    const region = 'ap-singapore-1'; // Dùng chung cho toàn bộ hàm
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

        // Trả về link URL đúng chuẩn Oracle
        return `https://objectstorage.${region}.oraclecloud.com/n/${namespace}/b/${bucket}/o/${encodeURIComponent(objectName)}`;
    } catch (error) {
        // In lỗi chi tiết ra Terminal để mình còn biết mà fix nếu tịt
        console.error("Lỗi Oracle Cloud chi tiết:", error);
        throw new Error("Không thể upload ảnh lên Cloud");
    }
};

module.exports = { uploadFileToOCI };