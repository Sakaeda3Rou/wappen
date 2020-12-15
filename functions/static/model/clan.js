const clanId = null;
const clan = {
    clanName : null,
    numberOfMember : null,
    official : null
}

exports.setClanId = (clanId) => {
    this.clanId = clanId;
}

exports.setClan = (clanName, numberOfMember, official) => {
    clan.clanName = clanName;
    clan.numberOfMember = numberOfMember;
    clan.official = official;
}

exports.getClanId = () => {
    return this.clanId;
}

exports.getClan = () => {
    return clan;
}
