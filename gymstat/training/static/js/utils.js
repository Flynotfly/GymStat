function formatDateForInput(dateString) {
    const date = new Date(dateString);

    // Extract the required components
    const [datePart, timePart] = dateString.split('T');
    const [year, month, day] = datePart.split('-');
    const [hours, minutes] = timePart.split(':');

    // Return the formatted string
    return `${year}-${month}-${day}T${hours}:${minutes}`;
}