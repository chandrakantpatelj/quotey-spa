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
  TableHead,
  TableContainer,
  LinearProgress,
  Divider,
  MenuItem,
  alpha,
  Collapse,
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
import {
  addNoteCommentMutation,
  createVendorStakeholderNote,
  getAllVendorNotesQuery,
  markNoteAsClosedMutation,
  updateStakeholderNote
} from 'src/@core/components/graphql/vendor-notes-queries'
import DeleteNote from './DeleteNote'
import CommonDateRangeFilter from 'src/common-components/CommonDateRangeFilter'
import { AddOutlined, KeyboardArrowDown, KeyboardArrowUp } from '@mui/icons-material'
import DeleteNoteComment from './DeleteNoteComment'

export default function NotesTab({ vendor }) {
  const dispatch = useDispatch()

  const [addNote, setAddNote] = useState(false)
  const [addComment, setAddComment] = useState({})
  const [selectedNotes, setSelectedNotes] = useState([])
  const [openDialog, setOpenDialog] = useState(false)
  const [openCommentDeleteDialog, setOpenCommentDeleteDialog] = useState(false)
  const [vendorNotesData, setVendorNotesData] = useState([])
  const [loadingNotes, setLoadingNotes] = useState(false)
  const [anchorElMap, setAnchorElMap] = useState({})
  const [anchorElMapComment, setAnchorElMapComment] = useState({})
  const moduleFilterDateDuration = useSelector(
    state => state.otherSettings?.data?.moduleFilterDateDuration || undefined
  )
  const [startDate, setStartDate] = useState(lastMonthDate(moduleFilterDateDuration))
  const [endDate, setEndDate] = useState(new Date())

  const {
    reset,
    control,
    handleSubmit,
    formState: { errors }
  } = useForm({
    mode: 'onChange'
  })

  useEffect(() => {
    getVendorNotes(startDate, endDate)
  }, [vendor])

  const updateVendorNotesState = response => {
    const updateNote = vendorNotesData.map(mapNote => {
      if (mapNote.noteId === response.noteId) {
        return response
      } else {
        return mapNote
      }
    })
    setVendorNotesData(updateNote)
  }

  const markIsDone = async note => {
    handleMenuClose(note)

    try {
      const response = await writeData(markNoteAsClosedMutation(), {
        noteId: note.noteId,
        tenantId: vendor?.tenantId
      })
      if (response.markNoteAsClosed) {
        dispatch(createAlert({ message: 'Mark is done successfully !', type: 'success' }))
        updateVendorNotesState(response.markNoteAsClosed)
      } else {
        dispatch(createAlert({ message: 'Mark is done failed !', type: 'error' }))
      }
    } catch (error) {
      console.error('error', error)
      dispatch(createAlert({ message: 'Mark is done failed !', type: 'error' }))
    }
  }

  const getVendorNotes = async (startDate, endDate) => {
    setLoadingNotes(true)
    setStartDate(startDate)
    setEndDate(endDate)
    const { getVendorNotes } = await fetchData(
      getAllVendorNotesQuery(vendor?.tenantId, vendor?.vendorId, startDate, endDate)
    )

    setVendorNotesData(getVendorNotes)
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
      vendorId: vendor?.vendorId
    }

    if (!isEditOpen) {
      try {
        const response = await writeData(createVendorStakeholderNote(), {
          stakeholderNote,
          tenantId: vendor?.tenantId
        })

        if (response.createStakeholderNote) {
          dispatch(createAlert({ message: 'Note Added  successfully !', type: 'success' }))
          setVendorNotesData(prev => [...prev, response.createStakeholderNote])
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
            vendorId: data?.vendorId
          },
          noteId: data.noteId,
          tenantId: vendor?.tenantId
        })

        if (response.updateStakeholderNote) {
          updateVendorNotesState(response.updateStakeholderNote)

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
    setAddComment(prev => {
      const index = Object.keys(prev)[0]
      return { [index]: false }
    })
    try {
      const response = await writeData(addNoteCommentMutation(), {
        tenantId: vendor?.tenantId,
        noteId: selectedNotes.noteId,
        comment: data.comment
      })

      if (response.addNoteComment) {
        dispatch(createAlert({ message: 'Comment Added  successfully !', type: 'success' }))
        updateVendorNotesState(response.addNoteComment)
        setAddComment({})
        reset()
      } else {
        setAddComment(prev => {
          const index = Object.keys(prev)[0]
          return { [index]: true }
        })
        dispatch(createAlert({ message: 'Comment Addition  failed !', type: 'error' }))
      }
    } catch (error) {
      setAddComment(prev => {
        const index = Object.keys(prev)[0]

        return { [index]: true }
      })
      console.error(error)
      dispatch(createAlert({ message: 'Comment Addition  failed !', type: 'error' }))
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
          // sx={{ fontSize: '21px' }}
          onClick={e => {
            const startDate = lastMonthDate(moduleFilterDateDuration)
            getVendorNotes(startDate, endDate)
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
          getData={getVendorNotes}
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

      {addNote ? (
        <>
          <form onSubmit={handleSubmit(saveVendorNotes)}>
            <Controller
              name='note'
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <CustomTextField
                  {...field}
                  id='note'
                  fullWidth
                  label='Notes'
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
                marginTop: { xs: '30px', sm: '50px' }
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
        </>
      ) : (
        <TableContainer>
          {loadingNotes ? (
            <LinearProgress sx={{ height: '5px' }} />
          ) : (
            <Table
              stickyHeader={true}
              sx={{
                //   minWidth: 380,
                width: '100%',
                '& .MuiTableCell-head ': {
                  padding: '12px 10px !important',
                  background: '#F4F6F8'
                },
                '& .MuiTableCell-root': {
                  padding: '8px 10px',
                  borderBottom: '1px dashed #EBEBEB',
                  textAlign: 'left'
                },
                '& .MuiTableCell-root:last-of-type': {
                  textAlign: 'right'
                }
              }}
            >
              <TableHead>
                <TableRow>
                  <TableCell></TableCell>
                  <TableCell sx={{ width: '30%' }}>Date</TableCell>
                  <TableCell sx={{ width: '35%' }}>Notes</TableCell>
                  <TableCell sx={{ width: '35%' }}>Status</TableCell>
                  <TableCell>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {vendorNotesData?.length !== 0 ? (
                  vendorNotesData?.map((note, index) => {
                    return (
                      <>
                        <TableRow key={note.noteId}>
                          <TableCell sx={{ width: '5%' }}>
                            <IconButton aria-label='expand row' size='small' onClick={() => handleExpand(index)}>
                              {open[index] ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
                            </IconButton>
                          </TableCell>
                          <TableCell> {DateFunction(note?.date)}</TableCell>
                          <TableCell>{note?.note}</TableCell>
                          <TableCell>{rowStatusChip(note?.status)}</TableCell>

                          <TableCell>
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
                                      alpha(theme.palette.error.main, theme.palette.action.selectedOpacity) +
                                      ' !important'
                                  }
                                }}
                              >
                                <Icon icon='mingcute:delete-2-line' color='inherit' />
                                Delete
                              </MenuItem>
                            </CommonStyledMenu>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          {/* <TableCell></TableCell> */}
                          <TableCell sx={{ padding: '0px !important' }} colSpan={5}>
                            <Collapse in={open[index]} timeout='auto'>
                              <Box sx={{ width: '100%', pt: '10px', pb: '15px', px: '6%' }}>
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
                                      <TableHead>
                                        <TableRow>
                                          <TableCell></TableCell>
                                          <TableCell sx={{ width: '30%' }}>Commented By</TableCell>
                                          <TableCell sx={{ width: '40%' }}>Comment</TableCell>
                                          <TableCell sx={{ width: '30%' }}>Created Date</TableCell>
                                          <TableCell>Action</TableCell>
                                        </TableRow>
                                      </TableHead>
                                      <TableBody>
                                        {note?.comments && note.comments.length > 0 ? (
                                          note.comments.map((comment, index) => (
                                            <TableRow key={index}>
                                              <TableCell></TableCell>
                                              <TableCell>
                                                {comment?.commentedBy ? DateFunction(comment?.commentedBy) : 'null'}
                                              </TableCell>
                                              <TableCell>{comment?.comment}</TableCell>
                                              <TableCell>{DateFunction(comment?.commentedDateTime)}</TableCell>

                                              <TableCell>
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
                                                {/* <IconButton
                                                  size='small'
                                                  variant='outlined'
                                                  color='error'
                                                  onClick={() => handleDeleteComment(note)}
                                                >
                                                  <Icon icon='mingcute:delete-2-line' color='inherit' />
                                                </IconButton> */}
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
                          </TableCell>
                        </TableRow>
                      </>
                    )
                  })
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
                          No notes found.{' '}
                        </Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </TableContainer>
      )}
      {openDialog && (
        <DeleteNote
          selectedNotes={selectedNotes}
          openDialog={openDialog}
          setOpenDialog={setOpenDialog}
          notesData={vendorNotesData}
          setNoteData={setVendorNotesData}
        />
      )}
      {openCommentDeleteDialog && (
        <DeleteNoteComment
          selectedNotes={selectedNotes}
          openCommentDeleteDialog={openCommentDeleteDialog}
          setOpenCommentDeleteDialog={setOpenCommentDeleteDialog}
          notesData={vendorNotesData}
          setNotesData={setVendorNotesData}
          selectedComment={selectedComment}
        />
      )}
    </>
  )
}
