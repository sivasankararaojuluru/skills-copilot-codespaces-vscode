function skillsMember() {
  return {
    restrict: 'E',
    scope: {},
    templateUrl: 'app/components/member/member.html',
    controller: 'SkillsMemberController',
    controllerAs: 'vm',
    bindToController: true,
    scope: {
      member: '='
    }
  };
}