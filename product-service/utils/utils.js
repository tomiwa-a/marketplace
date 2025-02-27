

function calculateMetaData(totalRecords, page, pageSize ){

    let metadata = {}
    metadata.current_page = Number(page)
    metadata.page_size = Number(pageSize)
    metadata.first_page = 1
    metadata.last_page = Math.ceil(totalRecords/pageSize)
    metadata.total_records = Number(totalRecords)

    return metadata
}

module.exports = {calculateMetaData}