"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const schedulerService_1 = require("./schedulerService");
const router = (0, express_1.Router)();
const schedulerService = new schedulerService_1.SchedulerService();
// GET /slots?weekStart=YYYY-MM-DD
router.get('/slots', async (req, res) => {
    try {
        const { weekStart } = req.query;
        if (!weekStart || typeof weekStart !== 'string') {
            return res.status(400).json({ error: 'weekStart parameter is required' });
        }
        // Validate date format
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(weekStart)) {
            return res.status(400).json({ error: 'weekStart must be in YYYY-MM-DD format' });
        }
        const slots = await schedulerService.getSlotsForWeek(weekStart);
        res.json(slots);
    }
    catch (error) {
        console.error('Error fetching slots:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// POST /slots
router.post('/slots', async (req, res) => {
    try {
        const slotData = req.body;
        // Validate required fields
        if (typeof slotData.weekday !== 'number' ||
            !slotData.start_time ||
            !slotData.end_time) {
            return res.status(400).json({
                error: 'weekday, start_time, and end_time are required'
            });
        }
        // Validate weekday range
        if (slotData.weekday < 0 || slotData.weekday > 6) {
            return res.status(400).json({
                error: 'weekday must be between 0 (Sunday) and 6 (Saturday)'
            });
        }
        // Validate time format (HH:MM)
        const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
        if (!timeRegex.test(slotData.start_time) || !timeRegex.test(slotData.end_time)) {
            return res.status(400).json({
                error: 'start_time and end_time must be in HH:MM format'
            });
        }
        const slot = await schedulerService.createSlot(slotData);
        res.status(201).json(slot);
    }
    catch (error) {
        console.error('Error creating slot:', error);
        if (error instanceof Error && error.message === 'Maximum 2 slots allowed per weekday') {
            return res.status(400).json({ error: error.message });
        }
        res.status(500).json({ error: 'Internal server error' });
    }
});
// PUT /slots/:id?date=YYYY-MM-DD
router.put('/slots/:id', async (req, res) => {
    try {
        const slotId = parseInt(req.params.id);
        const { date } = req.query;
        const updateData = req.body;
        if (isNaN(slotId)) {
            return res.status(400).json({ error: 'Invalid slot ID' });
        }
        if (!date || typeof date !== 'string') {
            return res.status(400).json({ error: 'date parameter is required' });
        }
        // Validate date format
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(date)) {
            return res.status(400).json({ error: 'date must be in YYYY-MM-DD format' });
        }
        // Validate time format if provided
        const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
        if (updateData.start_time && !timeRegex.test(updateData.start_time)) {
            return res.status(400).json({ error: 'start_time must be in HH:MM format' });
        }
        if (updateData.end_time && !timeRegex.test(updateData.end_time)) {
            return res.status(400).json({ error: 'end_time must be in HH:MM format' });
        }
        await schedulerService.updateSlotForDate(slotId, date, updateData);
        res.json({ message: 'Slot updated successfully' });
    }
    catch (error) {
        console.error('Error updating slot:', error);
        if (error instanceof Error && error.message === 'Slot not found') {
            return res.status(404).json({ error: error.message });
        }
        res.status(500).json({ error: 'Internal server error' });
    }
});
// DELETE /slots/:id?date=YYYY-MM-DD
router.delete('/slots/:id', async (req, res) => {
    try {
        const slotId = parseInt(req.params.id);
        const { date } = req.query;
        if (isNaN(slotId)) {
            return res.status(400).json({ error: 'Invalid slot ID' });
        }
        if (date) {
            // Delete for specific date (create exception)
            if (typeof date !== 'string') {
                return res.status(400).json({ error: 'date must be a string' });
            }
            // Validate date format
            const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
            if (!dateRegex.test(date)) {
                return res.status(400).json({ error: 'date must be in YYYY-MM-DD format' });
            }
            await schedulerService.deleteSlotForDate(slotId, date);
            res.json({ message: 'Slot deleted for specific date' });
        }
        else {
            // Delete entire recurring slot
            await schedulerService.deleteSlot(slotId);
            res.json({ message: 'Recurring slot deleted' });
        }
    }
    catch (error) {
        console.error('Error deleting slot:', error);
        if (error instanceof Error && error.message === 'Slot not found') {
            return res.status(404).json({ error: error.message });
        }
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.default = router;
//# sourceMappingURL=routes.js.map