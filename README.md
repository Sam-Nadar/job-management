The frontend is built using react & tailwind

Routes:

Register : https://job-management-rho.vercel.app/

Login: https://job-management-rho.vercel.app/login

Create Jobs & creation of jobs by uploading excel file : https://job-management-rho.vercel.app/createJobs

View & filter job list & download in excel file : https://job-management-rho.vercel.app/jobList

Upload company's logo : https://job-management-rho.vercel.app/company-logo
company logo is saved in backend

Features: 
1. Search & filter jobs based on email,location & category 
2. Pagination of Jobs in job list
3. Separate url to upload logosThis is a job management api build using postgreSql & express

The api has been changes & the documentation needs to be updated 
I have provided postman_collection.json , use that to send requests through postman 
Firstly set the variable to https://job-management-5dfc.onrender.com, I have used localhost so change it

API documentation:
User creation (POST) : https://job-management-5dfc.onrender.com/api/users
Give email in body . NOTE: store the uuid on notepad will come handy later

User deletion (DEL):  https://job-management-5dfc.onrender.com/api/users/{$id}
Give uuid that you get while user creation in the params instead of {$id}

Job creation (POST): https://job-management-5dfc.onrender.com/api/jobs/
Give title,description,salary:INT,location, category, postedById:String - UUID, in body. NOTE: store job id if you want to delete or update later

Fetching Jobs (GET): https://job-management-5dfc.onrender.com/api/jobs/

Job modification (PATCH): https://job-management-5dfc.onrender.com/api/jobs/{$id}
Give Job ID in the params instead of {$id} & give any value you want to update in body

Job deletion (POST):  https://job-management-5dfc.onrender.com/api/jobs/{$id}
Give Job ID in the params instead of {$id} & give any value you want to update in body

Job creation by uploading excel sheet (POST) : https://job-management-5dfc.onrender.com/api/jobs/bulk-upload
Choose form-data, choose file & give key as "file" & choose the excel file in value

Jobs grouped by email (GET) : https://job-management-5dfc.onrender.com/api/jobs/grouped-by-email
Choose params give key as "email" & any valid user email that was created in value

Exporting jobs in excel (GET) : https://job-management-5dfc.onrender.com/api/jobs/export-excel
In postman there will be 3 dots in respone section next to "Save as example" click on that & choose "save response to file" an excel file will automatically download


Uploading company logo (POST) : https://job-management-5dfc.onrender.com/api/company/upload-logo
Choose form-data, choose file & give key as "logo" & choose the image in value. Only jpeg,jpg & png supported

The excel files I choose to create Jobs via /bulk-upload is also there for refference.
