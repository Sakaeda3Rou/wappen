const clanId = null;
const clan = {
    clanName : null,
    searchClanName : null,
    numberOfMember : null,
    official : null
}

exports.setClanId = (clanId) => {
    this.clanId = clanId;
}

//if clanName is 'UNC', searchClanName is ['U', 'UN', 'UNC'];
exports.setClan = (clanName, searchClanName, numberOfMember, official) => {
    clan.clanName = clanName;
    clan.searchClanName = searchClanName;
    clan.numberOfMember = numberOfMember;
    clan.official = official;
}

exports.getClanId = () => {
    return this.clanId;
}

exports.getClan = () => {
    return clan;
}
