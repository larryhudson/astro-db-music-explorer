import { addDays, addWeeks, addMonths } from 'date-fns';

/**
 * Calculates the snooze until date based on the given number and unit of time.
 * 
 * @param {number} number - The number of time units to add to the current date.
 * @param {string} unit - The unit of time ('day', 'week', or 'month').
 * @returns {Date} The calculated snooze until date.
 */
export function calculateSnoozeUntilDate(number: number, unit: string) {
	const currentDate = new Date();

	switch (unit.toLowerCase()) {
		case 'day':
			return addDays(currentDate, number);
		case 'week':
			return addWeeks(currentDate, number);
		case 'month':
			return addMonths(currentDate, number);
		default:
			throw new Error('Invalid unit. Please use "day", "week", or "month".');
	}
}

export function formatDate(dateString) {
	return new Date(dateString).toLocaleString();
}
