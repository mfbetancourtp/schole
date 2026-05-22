export class GetRolesService {
    run() {
        return new Promise((resolve) => {
            resolve([
                {
                    id: 'teacher',
                    name: 'core.generalTerms.academic.teacher.plural',
                },
                {
                    id: 'student',
                    name: 'core.generalTerms.academic.student.plural',
                },
                {
                    id: 'tutor',
                    name: 'core.generalTerms.academic.tutor.plural',
                },
            ]);
        });
    }
}