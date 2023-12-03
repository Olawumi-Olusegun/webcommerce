import * as Yup from 'yup';
import categories from './categories';


const fileValidator = (file: File) => {
    if(!file) return true // optional field, return valid if no file found
    return file.size <= 1024 * 1024;
}

const commonSchema = {
    title: Yup.string().required('Title is required'),
    description: Yup.string().required('Description is required'),
    bulletPoints: Yup.array().of(Yup.string()),
    mrp: Yup.number().required('MRP is required').positive().integer(),
    salePrice: Yup.number().required('Sale Price is required')
               .positive().integer().max(Yup.ref('mrp'), 'Sale Price must be less than MRP'),
    category: Yup.string().required('Category is required').oneOf(categories), // Add your categories here
    quantity: Yup.number().required('Quantity is required').positive().integer(),
    images: Yup.array().of(
              Yup.mixed().test('fileSize', 'Image sizes must be less than 1MB', (file) => 
                fileValidator(file as File) // Allow empty field
    ))
}

export const NewProductInfoSchema = Yup.object().shape({
  ...commonSchema,
  thumbnail: Yup.mixed()
  .test('fileSize', 'Thumbnail size must be less than 1MB', (file) => {
  fileValidator(file as File)
  return true; // Allow empty field
  }).required('Thumbnail is required'),
});

export const updateProductInfoSchema = Yup.object().shape({ ...commonSchema });


// Define the validation schema
export const newProductInfoSchema = Yup.object().shape({
  ...commonSchema,
  thumbnail: Yup.mixed()
    .required("Thumbnail is required")
    .test("fileSize", "Thumbnail should be less than 1MB", (file) =>
      fileValidator(file as File)
    ),
});



