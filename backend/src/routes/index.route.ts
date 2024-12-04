import express from 'express';
const router = express.Router();
import { router as studentRouter } from './student.route';
// import programmingLanguagesController from '../controllers/programmingLanguages.controller';

// /* GET programming languages. */
// router.get('/', programmingLanguagesController.get);

// /* POST programming language */
// router.post('/', programmingLanguagesController.create);

// /* PUT programming language */
// router.put('/:id', programmingLanguagesController.update);

// /* DELETE programming language */
// router.delete('/:id', programmingLanguagesController.remove);

router.use("/student", studentRouter);
export default router;