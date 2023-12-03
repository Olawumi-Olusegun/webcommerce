import { getCloudConfig, getCloudSignature } from "../(admin_route)/products/action";


export const uploadImage = async (file: File) => {

    const { signature, timestamp } = await getCloudSignature();

    const cloudConfig = await getCloudConfig() as { name: string, key: string };

    const formData = new FormData();
    formData.append("file", file);
    formData.append("api_key", cloudConfig.key);
    formData.append("signature", signature);
    formData.append("timestamp", timestamp.toString());
    const endpoint = `https://api.cloudinary.com/v1_1/${cloudConfig.name}/image/upload`;

    const response = await fetch(endpoint, {
        method: "POST",
        body: formData,
    });

    const data = await response.json();
    
    return { url: data?.secure_url, id: data?.public_id }
}

export const formatPrice = (amount: number) => {
    const formatter = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "NGN",
    });

    return formatter.format(amount);
};

export const extractPublicId = (imageUrl: string) => {
    const splittedData = imageUrl.split("/");
    const lastItem = splittedData[splittedData.length - 1];
    const publicId = lastItem.split(".")[0];
    return publicId;
};