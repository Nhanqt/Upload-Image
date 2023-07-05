import {
  Ability,
  AbilityBuilder,
  AbilityClass,
  ExtractSubjectType,
  InferSubjects,
} from '@casl/ability';

import { Injectable } from '@nestjs/common';
import { AccountEntity } from 'src/account/entity/account.entity';
import { UserRole } from 'src/account/enums/account-role-enums';

export enum Action {
  Manage = 'manage',
  Create = 'create',
  Read = 'read',
  Update = 'update',
  Delete = 'delete',
}

export type Subjects = InferSubjects<typeof AccountEntity> | 'all';

export type AppAbility = Ability<[Action, Subjects]>;

@Injectable()
export class AbilityFactory {
  defineAbility(role: string) {
    const { can, cannot, build } = new AbilityBuilder(
      Ability as AbilityClass<AppAbility>,
    );

    if (role === 'ADMIN') {
      can(Action.Manage, 'all');
    }

    return build({
      detectSubjectType: (item) =>
        item.constructor as ExtractSubjectType<Subjects>,
    });
  }

  defineAbilityCreateTicketAssign(role: string) {
    const { can, cannot, build } = new AbilityBuilder(
      Ability as AbilityClass<AppAbility>,
    );
    if (role === 'LEADER') {
      can(Action.Create, 'all');
    }
    if (role === 'CO_LEADER') {
      can(Action.Create, 'all');
    }
    if (role === 'LEADER') {
      can(Action.Update, 'all');
    }
    if (role === 'CO_LEADER') {
      can(Action.Update, 'all');
    }
    return build({
      detectSubjectType: (item) =>
        item.constructor as ExtractSubjectType<Subjects>,
    });
  }
  defineAbilityUpdateTeamRole(role: string) {
    const { can, cannot, build } = new AbilityBuilder(
      Ability as AbilityClass<AppAbility>,
    );

    if (role === 'LEADER') {
      can(Action.Update, 'all');
    }
    return build({
      detectSubjectType: (item) =>
        item.constructor as ExtractSubjectType<Subjects>,
    });
  }

  defineAbilityEmployee(role: string) {
    const { can, cannot, build } = new AbilityBuilder(
      Ability as AbilityClass<AppAbility>,
    );

    if (role === 'EMPLOYEE') {
      can(Action.Read, 'all');
    }
    return build({
      detectSubjectType: (item) =>
        item.constructor as ExtractSubjectType<Subjects>,
    });
  }

  defineAbilityAdminAndEmployee(role: string) {
    const { can, cannot, build } = new AbilityBuilder(
      Ability as AbilityClass<AppAbility>,
    );

    if (role === 'ADMIN' || role === 'EMPLOYEE') {
      can(Action.Manage, 'all');
    }
    return build({
      detectSubjectType: (item) =>
        item.constructor as ExtractSubjectType<Subjects>,
    });
  }
  defineAbilityCallcenter(role: string) {
    const { can, cannot, build } = new AbilityBuilder(
      Ability as AbilityClass<AppAbility>,
    );

    if (role === 'CALL_CENTER') {
      can(Action.Manage, 'all');
    }
    return build({
      detectSubjectType: (item) =>
        item.constructor as ExtractSubjectType<Subjects>,
    });
  }

  defineAbilityCustomer(role: string) {
    const { can, cannot, build } = new AbilityBuilder(
      Ability as AbilityClass<AppAbility>,
    );

    if (role === UserRole.CUSTOMER) {
      can(Action.Manage, 'all');
    }
    return build({
      detectSubjectType: (item) =>
        item.constructor as ExtractSubjectType<Subjects>,
    });
  }
}
