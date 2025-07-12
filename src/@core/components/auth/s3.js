// import { S3 } from 'aws-sdk'
// class S3Singleton {
//   static instance = undefined
//   static async getInstance() {
//     if (S3Singleton.instance) {
//       return S3Singleton.instance
//     }
//     S3Singleton.instance = await S3Singleton.createInstance()
//     return S3Singleton.instance
//   }
//   static createInstance = async () => {
//     return new S3({
//       apiVersion: '2006-03-01',
//       region: 'ap-southeast-2',
//       params: { Bucket: 'wms-resourses-dev' }
//     })
//   }
// }
// export default S3Singleton
