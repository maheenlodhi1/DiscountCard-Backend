module.exports = {
  async up(db) {
    const subscriptions = [
      {
        name: "Premium",
        duration: 12,
        memberShipType: "premium",
        amount: 150,
        type: "membership",
        targetAudience: "customer",
      },
      {
        name: "Basic",
        duration: 12,
        packageType: "basic",
        type: "package",
        targetAudience: "partner",
        amount: 600,
      },
      {
        name: "Professional",
        duration: 12,
        packageType: "professional",
        type: "package",
        targetAudience: "partner",
        amount: 1500,
      },
      {
        name: "Premium",
        duration: 12,
        packageType: "premium",
        type: "package",
        targetAudience: "partner",
        amount: 2500,
      },
      {
        name: "Custom",
        duration: 12,
        packageType: "custom",
        type: "package",
        targetAudience: "partner",
        amount: 0,
      },
    ];

    for (const sub of subscriptions) {
      const exists = await db
        .collection("subscriptiontypes")
        .findOne({ name: sub.name, targetAudience: sub.targetAudience });
      if (!exists) {
        await db.collection("subscriptiontypes").insertOne(sub);
      }
    }

    // Insert referral commission setting
    const referralCommission = {
      type: "referralCommission",
      data: { referralCommission: 20 },
    };

    const settingExists = await db
      .collection("admin_settings")
      .findOne({ type: "referralCommission" });
    if (!settingExists) {
      await db.collection("admin settings").insertOne(referralCommission);
    }
  },

  async down(db) {
    await db.collection("subscriptiontypes").deleteMany({
      name: { $in: ["Premium", "Basic", "Professional", "Custom"] },
    });
    await db
      .collection("admin settings")
      .deleteOne({ type: "referralCommission" });
  },
};
