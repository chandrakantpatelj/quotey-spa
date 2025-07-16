import { useMemo } from 'react'
import { useSelector } from 'react-redux'
import { lastMonthDate } from 'src/common-functions/utils/UtilityFunctions'

const useDateRangeDefaults = () => {
  const moduleFilterDateDuration = useSelector(
    state => state.otherSettings?.data?.moduleFilterDateDuration || undefined
  )

  const oneMonthAgoDate = useMemo(() => lastMonthDate(moduleFilterDateDuration), [moduleFilterDateDuration])
  const todayDate = useMemo(() => new Date(), [])

  return { oneMonthAgoDate, todayDate }
}

export default useDateRangeDefaults
