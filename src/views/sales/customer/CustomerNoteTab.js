// ** Next Import
import { useEffect, useState } from 'react'
import {
  Box,
  Button,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableRow,
  Typography,
  TableContainer,
  LinearProgress,
  Divider,
  MenuItem,
  alpha,
  Collapse,
  Card,
  Grid
} from '@mui/material'
import Icon from 'src/@core/components/icon'
import { useDispatch, useSelector } from 'react-redux'
import RefreshIcon from '@mui/icons-material/Refresh'
import { DateFunction, lastMonthDate, rowStatusChip, todaysDate } from 'src/common-functions/utils/UtilityFunctions'
import { fetchData, writeData } from 'src/common-functions/GraphqlOperations'
import CustomTextField from 'src/@core/components/mui/text-field'
import { Controller, useForm } from 'react-hook-form'
import { createAlert } from 'src/store/apps/alerts'
import { SCHEMA_VERSION } from 'src/common-functions/utils/Constants'
import { Add, MoreVert } from '@mui/icons-material'
import CommonStyledMenu from 'src/common-components/CommonStyledMenu'

import CommonDateRangeFilter from 'src/common-components/CommonDateRangeFilter'
import { KeyboardArrowDown, KeyboardArrowUp } from '@mui/icons-material'
import {
  addNoteCommentMutation,
  createCustomerNotesMutation,
  getCustomerNotesQuery,
  markCustomerNoteAsClosedMutation,
  updateStakeholderNote
} from 'src/@core/components/graphql/customer-notes-queries'
import DeleteNoteComment from 'src/views/purchase/vendor/DeleteNoteComment'
import DeleteNote from 'src/views/purchase/vendor/DeleteNote'

export default function CustomerNoteTab({ customer }) {
  const dispatch = useDispatch()
  const [addNote, setAddNote] = useState(false)
  const [addComment, setAddComment] = useState({})
  const [selectedNotes, setSelectedNotes] = useState([])
  const [openDialog, setOpenDialog] = useState(false)
  const [openCommentDeleteDialog, setOpenCommentDeleteDialog] = useState(false)
  const [customerNotesData, setCustomerNotesData] = useState([])
  const [loadingNotes, setLoadingNotes] = useState(false)
  const [anchorElMap, setAnchorElMap] = useState({})
  const [anchorElMapComment, setAnchorElMapComment] = useState({})
  const moduleFilterDateDuration = useSelector(
    state => state.otherSettings?.data?.moduleFilterDateDuration || undefined
  )
  const [startDate, setStartDate] = useState(lastMonthDate(moduleFilterDateDuration))
  const [endDate, setEndDate] = useState(new Date())
  const [selectedIndex, setSelectedIndex] = useState()
  const {
    reset,
    control,
    handleSubmit,
    formState: { errors }
  } = useForm({
    mode: 'onChange'
  })
  useEffect(() => {
    getCustomerNotes(startDate, endDate)
  }, [customer])

  const updateCustomerNotesState = response => {
    const updateNote = customerNotesData.map(mapNote => {
      if (mapNote.noteId === response.noteId) {
        return response
      } else {
        return mapNote
      }
    })
    setCustomerNotesData(updateNote)
  }

  const markIsDone = async note => {
    handleMenuClose(note)

    try {
      const response = await writeData(markCustomerNoteAsClosedMutation(), {
        noteId: note.noteId,
        tenantId: customer?.tenantId
      })
      if (response.markNoteAsClosed) {
        dispatch(createAlert({ message: 'Mark is done successfully !', type: 'success' }))
        updateCustomerNotesState(response.markNoteAsClosed)
      } else {
        dispatch(createAlert({ message: 'Mark is done failed !', type: 'error' }))
      }
    } catch (error) {
      console.error('error', error)
      dispatch(createAlert({ message: 'Mark is done failed !', type: 'error' }))
    }
  }

  const getCustomerNotes = async (startDate, endDate) => {
    setLoadingNotes(true)
    setStartDate(startDate)
    setEndDate(endDate)
    const { getCustomerNotes } = await fetchData(
      getCustomerNotesQuery(customer?.tenantId, customer?.customerId, startDate, endDate)
    )

    setCustomerNotesData(getCustomerNotes)
    setLoadingNotes(false)
  }

  const handleDeleteNote = note => {
    setOpenDialog(true)
    setSelectedNotes(note)
  }

  const handleDeleteComment = comment => {
    setOpenCommentDeleteDialog(true)
    setSelectedNotes(comment)
  }

  const handleMenuClose = note => {
    const updatedAnchorElMap = { ...anchorElMap }
    updatedAnchorElMap[note.noteId] = null
    setAnchorElMap(updatedAnchorElMap)
  }

  const handleCommentMenuClose = comment => {
    const updateAnchorElMapComment = { ...anchorElMapComment }
    updateAnchorElMapComment[comment.commentId] = null
    setAnchorElMapComment(updateAnchorElMapComment)
  }

  const handleMenuClick = (event, note) => {
    setSelectedNotes(note)
    const updatedAnchorElMap = { ...anchorElMap }
    updatedAnchorElMap[note.noteId] = event.currentTarget
    setAnchorElMap(updatedAnchorElMap)
  }

  const [selectedComment, setSelectedComment] = useState({})

  const handleOpenCommentMenu = (event, comment, note) => {
    setSelectedNotes(note)
    setSelectedComment(comment)
    const updatedAnchorElMap = { ...anchorElMapComment }
    updatedAnchorElMap[comment.commentId] = event.currentTarget
    setAnchorElMapComment(updatedAnchorElMap)
  }

  const handleAddNote = () => {
    setAddNote(true)
  }

  const handleAddComment = (note, index) => {
    setSelectedNotes(note)
    reset()

    setAddComment({ [index]: true })
  }
  const [isEditOpen, setIsEditOpen] = useState(false)

  const handleEdit = note => {
    setAddNote(true)
    setIsEditOpen(true)
    reset(note)
  }

  const saveVendorNotes = async data => {
    setAddNote(false)
    setLoadingNotes(true)

    const stakeholderNote = {
      schemaVersion: SCHEMA_VERSION,
      note: data.note,
      date: todaysDate(),
      customerId: customer?.customerId
    }

    if (!isEditOpen) {
      try {
        const response = await writeData(createCustomerNotesMutation(), {
          stakeholderNote,
          tenantId: customer?.tenantId
        })

        if (response.createStakeholderNote) {
          dispatch(createAlert({ message: 'Note Added  successfully !', type: 'success' }))
          setCustomerNotesData(prev => [...prev, response.createStakeholderNote])
          reset()
        } else {
          dispatch(createAlert({ message: 'Note Addition  failed !', type: 'error' }))
        }
      } catch (error) {
        console.error(error)
        setAddNote(true)
        dispatch(createAlert({ message: 'Note Addition  failed !', type: 'error' }))
      } finally {
        setLoadingNotes(false)
      }
    } else {
      try {
        const response = await writeData(updateStakeholderNote(), {
          stakeholderNote: {
            schemaVersion: SCHEMA_VERSION,
            note: data.note,
            date: data.date,
            customerId: data?.customerId
          },
          noteId: data.noteId,
          tenantId: customer?.tenantId
        })

        if (response.updateStakeholderNote) {
          updateCustomerNotesState(response.updateStakeholderNote)

          dispatch(createAlert({ message: 'Note Update  successfully !', type: 'success' }))
          reset()
        } else {
          dispatch(createAlert({ message: 'Note Updation failed !', type: 'error' }))
        }
      } catch (error) {
        console.error(error)
        setAddNote(true)
        dispatch(createAlert({ message: 'Note Updation failed !', type: 'error' }))
      } finally {
        setLoadingNotes(false)
      }
      handleMenuClose(data)
    }
  }

  const saveComment = async data => {
    console.log('Adding comment to note: ', data)
    setAddComment(prev => {
      const index = Object.keys(prev)[0]
      return { [index]: false }
    })

    try {
      const response = await writeData(addNoteCommentMutation(), {
        tenantId: customer?.tenantId,
        noteId: selectedNotes.noteId, // Ensure the noteId is sent correctly
        comment: data.comment
      })

      if (response.addNoteComment) {
        dispatch(createAlert({ message: 'Comment Added  successfully !', type: 'success' }))
        updateCustomerNotesState(response.addNoteComment)

        reset()
      } else {
        setAddComment(prev => {
          const index = Object.keys(prev)[0]

          return { [index]: true }
        })
        dispatch(createAlert({ message: 'Comment Addition failed!', type: 'error' }))
      }
    } catch (error) {
      console.error(error)
      setAddComment(prev => {
        const index = Object.keys(prev)[0]

        return { [index]: true }
      })
      dispatch(createAlert({ message: 'Comment Addition failed!', type: 'error' }))
    }
  }

  const [open, setOpen] = useState({})

  const handleExpand = index => {
    setOpen(prevOpen => ({
      ...prevOpen,
      [index]: !prevOpen[index]
    }))
  }

  return (
    <>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'start',
          alignItems: 'center',
          mb: 3,
          gap: 3
        }}
      >
        <IconButton
          color='secondary'
          onClick={e => {
            const startDate = lastMonthDate(moduleFilterDateDuration)
            getCustomerNotes(startDate, endDate)
          }}
        >
          <RefreshIcon />
        </IconButton>
        <CommonDateRangeFilter
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'left'
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'left'
          }}
          getData={getCustomerNotes}
        />

        <Button
          sx={{
            ml: 'auto'
          }}
          variant='contained'
          startIcon={<Add />}
          onClick={() => handleAddNote()}
        >
          Note
        </Button>
      </Box>
      <Box sx={{ mt: 5 }}>
        {addNote ? (
          <form onSubmit={handleSubmit(saveVendorNotes)}>
            <Controller
              name='note'
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <CustomTextField
                  {...field}
                  id='note'
                  label='Notes'
                  multiline
                  fullWidth
                  minRows={4}
                  error={Boolean(errors.note)}
                  {...(errors.companyName && { helperText: 'Notes is required' })}
                />
              )}
            />

            <Box
              sx={{
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: { xs: 'center', sm: 'start' },
                gap: '20px',
                marginTop: '10px'
              }}
            >
              <Button variant='contained' type='submit'>
                Save
              </Button>
              <Button
                variant='outlined'
                type='reset'
                onClick={() => {
                  setAddNote(false)
                  reset()
                }}
              >
                Cancel
              </Button>
            </Box>
          </form>
        ) : (
          <>
            {loadingNotes ? (
              <LinearProgress sx={{ height: '5px' }} />
            ) : customerNotesData?.length !== 0 ? (
              customerNotesData?.map((note, index) => {
                return (
                  <Card key={note.noteId} sx={{ p: 2, mb: 2 }}>
                    <Box sx={{ display: 'flex', gap: 2, justifyContent: 'space-between' }}>
                      <IconButton aria-label='expand row' size='small' onClick={() => handleExpand(index)}>
                        {open[index] ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
                      </IconButton>
                      <Grid container spacing={{ xs: 2, md: 4 }} sx={{ alignItems: 'center' }}>
                        <Grid item xs={12} sm={9.5}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                            <span style={{ color: '#818181', fontSize: '12px' }}> {DateFunction(note?.date)} </span>
                            {rowStatusChip(note?.status)}
                          </Box>
                          {note?.note} <br />
                        </Grid>
                      </Grid>
                      <IconButton
                        aria-label='more'
                        id='long-button'
                        size='small'
                        aria-haspopup='true'
                        onClick={event => handleMenuClick(event, note)}
                      >
                        <MoreVert />
                      </IconButton>
                      <CommonStyledMenu
                        anchorEl={anchorElMap[note.noteId]}
                        open={Boolean(anchorElMap[note.noteId])}
                        onClose={() => handleMenuClose(note)}
                      >
                        <MenuItem onClick={() => handleEdit(note)}>
                          <Icon icon='tabler:edit' />
                          Edit
                        </MenuItem>
                        {note?.status !== 'CLOSED' && (
                          <MenuItem onClick={() => markIsDone(note)}>
                            <Icon icon='simple-line-icons:close' />
                            Mark As Closed
                          </MenuItem>
                        )}
                        <Divider sx={{ my: 1 }} />
                        <MenuItem
                          onClick={() => handleDeleteNote(note)}
                          sx={{
                            color: theme => theme?.palette?.error?.main,
                            '&:hover': {
                              color: theme => theme?.palette?.error?.main + ' !important',
                              backgroundColor: theme =>
                                alpha(theme.palette.error.main, theme.palette.action.selectedOpacity) + ' !important'
                            }
                          }}
                        >
                          <Icon icon='mingcute:delete-2-line' color='inherit' />
                          Delete
                        </MenuItem>
                      </CommonStyledMenu>
                    </Box>
                    <Collapse in={open[index]} timeout='auto'>
                      <Box sx={{ width: '100%', pt: '10px', pb: '15px', px: '6%', borderTop: '1px solid #D8D8D8' }}>
                        {!addComment[index] && (
                          <Button
                            size='small'
                            sx={{
                              ml: 'auto',
                              mb: 2
                            }}
                            variant='outlined'
                            startIcon={<Add />}
                            onClick={() => handleAddComment(note, index)}
                          >
                            Add Comment
                          </Button>
                        )}

                        {addComment[index] ? (
                          <>
                            <form onSubmit={handleSubmit(saveComment)}>
                              <Controller
                                name='comment'
                                control={control}
                                rules={{ required: true }}
                                render={({ field }) => (
                                  <CustomTextField
                                    {...field}
                                    id='comment'
                                    fullWidth
                                    label='Comments'
                                    error={Boolean(errors.comment)}
                                    {...(errors.companyName && { helperText: 'Comments is required' })}
                                  />
                                )}
                              />

                              <Box
                                sx={{
                                  display: 'flex',
                                  flexWrap: 'wrap',
                                  justifyContent: { xs: 'center', sm: 'start' },
                                  gap: '10px',
                                  marginTop: '20px'
                                }}
                              >
                                <Button size='small' variant='contained' type='submit'>
                                  Save
                                </Button>
                                <Button
                                  size='small'
                                  variant='outlined'
                                  type='reset'
                                  onClick={() => {
                                    setAddComment({ [index]: false })
                                    reset()
                                  }}
                                >
                                  Cancel
                                </Button>
                              </Box>
                            </form>
                          </>
                        ) : (
                          <>
                            <Table
                              size='small'
                              sx={{
                                '& .MuiTableCell-head ': {
                                  textTransform: 'capitalize',
                                  background: '#d8d8d838 !important'
                                },
                                '& .MuiTableHead-root': {
                                  fontSize: '12px',
                                  py: '10px'
                                },
                                '& .MuiTableCell-root': {
                                  borderBottom: '1px dotted #D8D8D8',
                                  fontSize: '12px',
                                  py: '10px'
                                }
                              }}
                            >
                              <TableBody>
                                {note?.comments && note.comments.length > 0 ? (
                                  note.comments.map((comment, index) => (
                                    <TableRow key={index}>
                                      <TableCell>
                                        {comment?.commentedBy ? (
                                          <>
                                            <span style={{ color: '#818181', fontSize: '12px' }}>
                                              {' '}
                                              By: DateFunction(comment?.commentedBy)
                                            </span>{' '}
                                            <br />
                                          </>
                                        ) : null}
                                        {comment?.comment} <br />
                                        <span style={{ color: '#818181', fontSize: '12px' }}>
                                          {' '}
                                          {DateFunction(comment?.commentedDateTime)}{' '}
                                        </span>
                                      </TableCell>

                                      <TableCell sx={{ width: '10%' }}>
                                        <IconButton
                                          aria-label='more'
                                          id='long-button'
                                          size='small'
                                          aria-haspopup='true'
                                          onClick={event => handleOpenCommentMenu(event, comment, note)}
                                        >
                                          <MoreVert />
                                        </IconButton>
                                        <CommonStyledMenu
                                          anchorEl={anchorElMapComment[comment.commentId]}
                                          open={Boolean(anchorElMapComment[comment.commentId])}
                                          onClose={() => handleCommentMenuClose(comment)}
                                        >
                                          <MenuItem
                                            onClick={() => handleDeleteComment(note)}
                                            sx={{
                                              color: theme => theme?.palette?.error?.main,
                                              '&:hover': {
                                                color: theme => theme?.palette?.error?.main + ' !important',
                                                backgroundColor: theme =>
                                                  alpha(
                                                    theme.palette.error.main,
                                                    theme.palette.action.selectedOpacity
                                                  ) + ' !important'
                                              }
                                            }}
                                          >
                                            <Icon icon='mingcute:delete-2-line' color='inherit' />
                                            Delete
                                          </MenuItem>
                                        </CommonStyledMenu>
                                      </TableCell>
                                    </TableRow>
                                  ))
                                ) : (
                                  <TableRow>
                                    <TableCell colSpan={5}>
                                      <Box
                                        sx={{
                                          maxWidth: '850px',
                                          width: '100%',
                                          border: '2px dotted #eee',
                                          margin: '0 auto',
                                          padding: '30px 10px' // top-bottom 10px, left-right 20px
                                        }}
                                      >
                                        <Typography variant='h6' align='center' sx={{ opacity: '0.8' }}>
                                          No data available
                                        </Typography>
                                      </Box>
                                    </TableCell>
                                  </TableRow>
                                )}
                              </TableBody>
                            </Table>
                          </>
                        )}
                      </Box>
                    </Collapse>
                  </Card>
                )
              })
            ) : (
              <Box
                sx={{
                  maxWidth: '850px',
                  width: '100%',
                  border: '2px dotted #eee',
                  margin: '0 auto',
                  padding: '30px 10px'
                }}
              >
                <Typography variant='h6' align='center' sx={{ opacity: '0.8' }}>
                  No notes found.{' '}
                </Typography>
              </Box>
            )}
          </>
        )}
      </Box>

      {openCommentDeleteDialog && (
        <DeleteNoteComment
          selectedNotes={selectedNotes}
          openCommentDeleteDialog={openCommentDeleteDialog}
          setOpenCommentDeleteDialog={setOpenCommentDeleteDialog}
          notesData={customerNotesData}
          setNotesData={setCustomerNotesData}
          selectedComment={selectedComment}
        />
      )}
      {openDialog && (
        <DeleteNote
          selectedNotes={selectedNotes}
          openDialog={openDialog}
          setOpenDialog={setOpenDialog}
          notesData={customerNotesData}
          setNoteData={setCustomerNotesData}
        />
      )}
    </>
  )
}
