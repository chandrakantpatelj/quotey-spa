'use client'
import { Button, LinearProgress, Typography } from '@mui/material'
import { useEffect, useState } from 'react'
import { fetchPdfFile } from 'src/common-functions/utils/UtilityFunctions'
import ShowFileList from 'src/views/forms/form-elements/custom-inputs/ShowFileList'
import AddOutlinedIcon from '@mui/icons-material/AddOutlined'
import { Box } from '@mui/system'
import { writeData } from 'src/common-functions/GraphqlOperations'
import { useDispatch } from 'react-redux'
import { createAlert } from 'src/store/apps/alerts'
import CustomFilesUpload from 'src/views/forms/form-elements/custom-inputs/CustomFilesUpload'
import DeleteUploadFile from 'src/views/forms/form-elements/custom-inputs/DeleteUploadFile'
import { UploadMultipleFileS3Api } from 'src/views/forms/form-elements/custom-inputs/UploadMultipleFileS3Api'
import { setActionSalesOrder, setUpdateSalesOrder } from 'src/store/apps/sales'
import { deleteFileFromProduct } from 'src/@core/components/graphql/item-queries'
import { setSelectedProduct, setUpdateProduct } from 'src/store/apps/products'
import { attachFileToGeneralExpenseQuery } from 'src/@core/components/graphql/general-expense-queries'

export default function AttachmentTabExpense({ expense, folderName }) {
  const dispatch = useDispatch()
  const [selectedPdFile, setSelectedPdFile] = useState([])
  const [loading, setLoading] = useState(true)
  const [openUploadFile, setOpenUploadFile] = useState(false)
  const [selectedFilesToUpload, setSelectedFilesToUpload] = useState([])
  const [value, setValue] = useState()

  useEffect(() => {
    if (expense?.files?.length > 0) {
      setSelectedPdFile([])
      expense?.files?.map(item => {
        fetchPdfFile(setSelectedPdFile, item)
      })
      setLoading(false)
    } else {
      setLoading(false)
    }
  }, [expense])

  const handleCancel = () => {
    setOpenUploadFile(false)
    setSelectedFilesToUpload([])
  }

  const handleUploadFiles = async () => {
    setLoading(true)
    const filePathsArray = selectedFilesToUpload?.map(item => {
      return { key: item.key, fileName: item.fileName }
    })
    try {
      const response = await writeData(attachFileToGeneralExpenseQuery(), {
        tenantId: expense.tenantId,
        expenseId: expense.expenseId,
        files: filePathsArray
      })
      if (response.attachFileToProduct) {
        await UploadMultipleFileS3Api(selectedFilesToUpload, dispatch)

        dispatch(setUpdateProduct({ ...expense, files: response.attachFileToProduct }))
        dispatch(setSelectedProduct({ ...expense, files: response.attachFileToProduct }))
        setSelectedPdFile(response.attachFileToProduct)
        dispatch(createAlert({ message: 'File Upload successfully!', type: 'success' }))
        setOpenUploadFile(false)
        setLoading(false)
      } else {
        setLoading(false)
        dispatch(createAlert({ message: 'Failed to upload file', type: 'error' }))
      }
    } catch (error) {
      setLoading(false)
      console.error(error)
      dispatch(createAlert({ message: 'Failed to delete file', type: 'error' }))
    }
  }
  const removeFile = async file => {
    setLoading(true)
    try {
      const response = await writeData(deleteFileFromProduct(), {
        tenantId: expense.tenantId,
        expenseId: expense.expenseId,
        file
      })

      if (response.deleteFileFromProduct) {
        await DeleteUploadFile(file.key)
        dispatch(setUpdateSalesOrder({ ...expense, files: response.deleteFileFromProduct }))
        dispatch(setActionSalesOrder({ ...expense, files: response.deleteFileFromProduct }))
        setSelectedPdFile(response.deleteFileFromProduct)

        dispatch(createAlert({ message: 'File delete successfully!', type: 'success' }))
        setLoading(false)
      } else {
        dispatch(createAlert({ message: 'Failed to delete file', type: 'error' }))
        setLoading(false)
      }
    } catch (error) {
      setLoading(false)
      console.error(error)
      dispatch(createAlert({ message: 'Failed to delete file', type: 'error' }))
    }
  }

  return (
    <>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'flex-end',
          mb: 5
        }}
      >
        {!openUploadFile && (
          <Button
            size='small'
            variant='contained'
            color='primary'
            startIcon={<AddOutlinedIcon />}
            scroll={true}
            onClick={() => {
              setSelectedFilesToUpload([])
              setOpenUploadFile(true)
            }}
          >
            Upload Files
          </Button>
        )}
      </Box>

      {loading ? (
        <LinearProgress />
      ) : openUploadFile ? (
        <>
          <CustomFilesUpload
            setValue={setValue}
            selectedPdFile={selectedFilesToUpload}
            setSelectedPdFile={setSelectedFilesToUpload}
            folderName={folderName}
          />
          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: { xs: 'center', sm: 'start' },
              gap: { xs: '10px', md: '20px' },
              marginTop: { xs: '20px', sm: '30px' }
            }}
          >
            {selectedFilesToUpload.length > 0 ? (
              <Button variant='contained' type='submit' onClick={() => handleUploadFiles()}>
                Save
              </Button>
            ) : (
              <Button variant='contained' disabled>
                Save
              </Button>
            )}

            <Button variant='outlined' onClick={() => handleCancel()}>
              Cancel
            </Button>
          </Box>
        </>
      ) : selectedPdFile?.length > 0 ? (
        <ShowFileList selectedPdFile={selectedPdFile} removeFile={removeFile} />
      ) : (
        <Box
          sx={{
            maxWidth: '850px',
            width: '100%',
            border: '2px solid',
            margin: '0px auto',
            padding: '100px 20px ' // top-bottom 10px, left-right 20px
          }}
        >
          <Typography variant='h5' align='center' display='block'>
            Empty Attachments
          </Typography>
        </Box>
      )}
    </>
  )
}
