# Uploaded Files

This directory stores files uploaded by the LyraJS FileUploader service.

## How it works ? 

### Access Files From Request With MultipartFormData In Controllers

```ts
const { fields, files } = this.req.multipartData
```

Or using the MultipartParser

```ts
const { fields, files } = await this.multipartParser.parse(this.req)
```

### Store File In The Uploads Folder

```ts
const uploadedFile = await this.fileManager.uploadFile(files[0])
```

FileManager will generate a random, uniq and clean file name. 

### File Access Route

```ts
app.use("/uploads", isAuthenticated)
app.serveStatic(base_path + "/uploads", {
  root: "uploads"
})
```

### File Delete

```ts
await this.fileManager.deleteFile(filename)
```

# Warning

This file being in the ``/uploads`` folder, it will be accessible using the file access route. Moving it or remove it is recommended. 