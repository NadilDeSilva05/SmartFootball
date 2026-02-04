import Grid from '@mui/material/Grid'
import BasicDataTables from '@views/react-table/BasicDataTables'
import ColumnVisibility from '@views/react-table/ColumnVisibility'

const ReactTablePage = () => (
  <Grid container spacing={6}>
    <Grid item xs={12}>
      <BasicDataTables />
    </Grid>
    <Grid item xs={12}>
      <ColumnVisibility />
    </Grid>
  </Grid>
)

export default ReactTablePage
