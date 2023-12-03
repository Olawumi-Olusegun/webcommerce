"use client";

import { Button, Input } from "@material-tailwind/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { ChangeEventHandler, useEffect, useState, useTransition } from "react";
import * as yup from 'yup';
import { extractPublicId, uploadImage } from "../utils/helpers";
import { createFeaturedProduct, updateFeaturedProduct } from "../(admin_route)/products/featured/action";
import { toast } from 'react-toastify';
import { FeaturedProductForUpdate } from "../types";
import { removeImageFromCloud } from "../(admin_route)/products/action";


export interface FeaturedProduct {
  file?: File;
  title: string;
  link: string;
  linkTitle: string;
}

interface Props {
  initialValue?: any;
}

const commonValidationFeaturedProduct = {
  title: yup.string().required("Title is required"),
  link: yup.string().required("Link is required"),
  linkTitle: yup.string().required("Link title is required"),
};

const newFeaturedProductValidationSchema = yup.object().shape({
  file: yup.mixed<File>()
    .required("File is required")
    .test(
      "fileType",
      "Invalid file format. Only image files are allowed.",
      (value) => {
        if (value) {
          const supportedFormats = ["image/jpeg", "image/png", "image/gif"];
          return supportedFormats.includes((value as File).type);
        }
        return true;
      }
    ),
  ...commonValidationFeaturedProduct,
});

const oldFeaturedProductValidationSchema = yup.object().shape({
  file: yup.mixed<File>().test(
    "fileType",
    "Invalid file format. Only image files are allowed.",
    (value) => {
      if (value) {
        const supportedFormats = ["image/jpeg", "image/png", "image/gif"];
        return supportedFormats.includes((value as File).type);
      }
      return true;
    }
  ),
  ...commonValidationFeaturedProduct,
});

const defaultProduct = {
  title: "",
  link: "",
  linkTitle: "",
};

export default function FeaturedProductForm({ initialValue }: Props) {
    const router = useRouter();
  const [isForUpdate, setIsForUpdate] = useState(false);
  const [featuredProduct, setFeaturedProduct] = useState<FeaturedProduct>(defaultProduct);

  const [isPending, startTransition] = useTransition();

  const handleChange: ChangeEventHandler<HTMLInputElement> = ({ target }) => {
    
    const { name, value, files } = target;

    if (name === "file" && files) {
      const file = files[0];
      if (file) setFeaturedProduct({ ...featuredProduct, file });
    } else setFeaturedProduct({ ...featuredProduct, [name]: value });
  };

  useEffect(() => {
    if (initialValue) {
      setFeaturedProduct({ ...initialValue });
      setIsForUpdate(true);
    }
  }, [initialValue]);

  const handleCreate = async () => {

    try {
      const { file, link, linkTitle, title } =
        await newFeaturedProductValidationSchema.validate(
          { ...featuredProduct },
          { abortEarly: false }
        );

      const banner = await uploadImage(file);

      await createFeaturedProduct({ banner, link, linkTitle, title }); 
      router.refresh();
      setFeaturedProduct({ ...defaultProduct });
    } catch (error) {
      if (error instanceof yup.ValidationError) {
        error.inner.map((err) => {
          toast.error(err.message);
        });
      }
    }
  };

  const handleUpdate = async () => {
    try {
      const { file, link, linkTitle, title } =
        await oldFeaturedProductValidationSchema.validate(
          { ...featuredProduct },
          { abortEarly: false }
        );

        const data: FeaturedProductForUpdate = { link, linkTitle, title };

      if(file) {
        const publicId = extractPublicId(initialValue.banner);
        await removeImageFromCloud(publicId);
        const banner = await uploadImage(file);
        data.banner = banner;
      }

      await updateFeaturedProduct(initialValue.id, { ...data }); 
      router.refresh();
      router.push("/products/featured/add");
      // setFeaturedProduct({ ...defaultProduct });
    } catch (error) {
      if (error instanceof yup.ValidationError) {
        error.inner.map((err) => {
          toast.error(err.message);
        });
      }
    }
  }

  const handleSubmit = async () => {
    if (isForUpdate) await handleUpdate();
    else await handleCreate();
  };



  const poster = featuredProduct.file
    ? URL.createObjectURL(featuredProduct.file)
    : initialValue?.banner || "";

  const { link, linkTitle, title } = featuredProduct;



  return (
    <form 
    onSubmit={(event) => startTransition(async () => {
      event.preventDefault()
      await handleSubmit();
    }  )}
    className="py-4 space-y-4">
      <label htmlFor="banner-file">
        <input
          type="file"
          accept="image/*"
          id="banner-file"
          name="file"
          onChange={handleChange}
          hidden
        />
        <div className="h-[380px] w-full flex flex-col items-center justify-center border border-dashed border-blue-gray-400 rounded cursor-pointer relative">
          {poster ? (
            <Image alt="banner" src={poster || initialValue?.banner} fill />
          ) : (
            <>
              <span>Select Banner</span>
              <span>1140 x 380</span>
            </>
          )}
        </div>
      </label>
      <Input label="Title" name="title" value={title} onChange={handleChange} />
      <div className="flex space-x-4">
        <Input label="Link" name="link" value={link} onChange={handleChange} />
        <Input
          label="Lik Title"
          name="linkTitle"
          value={linkTitle}
          onChange={handleChange}
        />
      </div>
      <div className="text-right">
        <Button disabled={isPending} type="submit">{isForUpdate ? "Update" : "Submit"}</Button>
      </div>
    </form>
  );
}
