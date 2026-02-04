import AppCalendar from '@views/apps/calendar/CalendarWrapper'
import { calendarEvents } from '@/data/sampleData'

const CalendarPage = () => <AppCalendar events={calendarEvents || []} />

export default CalendarPage
