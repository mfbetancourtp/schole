import axios from '../../../shared/utils/axios';
import {services} from '../../../shared/constant/services';

interface IUpdateConfigureStepSequenceService {
  convocationStepId: number;
  requiresApproval: boolean;
  applyOnlyOlds: boolean;
  applyOnlyNew: boolean;
  solveAdmin: boolean;
}

export class UpdateConfigureStepSequenceService {
  async run(data: IUpdateConfigureStepSequenceService): Promise<void> {
    await axios.post(`${services.academic}/academic-planning/convocation-steps-update-requires-approval`, data);
  }
}