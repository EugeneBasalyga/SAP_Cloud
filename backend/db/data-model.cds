namespace com.bank;

entity Customer {
    key id: Integer;
    surname: String(50);
    name: String(50);
    middleName: String(50);
    birthDate: Date;
    sex: String(20);
    passportSeries: String(10);
    passportNumber: String(20);
    issuedBy: String(50);
    issuedWhen: Date;
    identNumber: String(50);
    birthPlace: String(50);
    actResCity: Association to ActualResidenceCity;
    actResAddress: String(50);
    phoneNumber: String(30);
    workPlace: String(100);
    workPosition: String(50);
    regCity: Association to RegistrationCity;
    maritalStatus: Association to MaritalStatus;
    citizenship: Association to Citizenship;
    disability: Association to Disability;
    isPensioner: Boolean;
    deposits: Association to many Deposit on deposits.customer = $self;
    loans: Association to many Loan on loans.customer = $self;
};

entity ActualResidenceCity {
    key id: Integer;
    name: String(50);
    customers: Association to many Customer on customers.actResCity = $self;
};

entity RegistrationCity {
    key id: Integer;
    name: String(50);
    customers: Association to many Customer on customers.regCity = $self;
};

entity MaritalStatus {
    key id: Integer;
    name: String(50);
    customers: Association to many Customer on customers.maritalStatus = $self;
};

entity Citizenship {
    key id: Integer;
    name: String(50);
    customers: Association to many Customer on customers.citizenship = $self;
};

entity Disability {
    key id: Integer;
    name: String(50);
    customers: Association to many Customer on customers.disability = $self;
};

entity Deposit {
    key id: Integer;
    customer: Association to Customer;
    contract_number: String(50);
    startDate: Date;
    endDate: Date;
    initialSum: DecimalFloat;
    curBalance: DecimalFloat;
    percentage: Integer;
    type: Association to DepositType;
    currency: Association to DepositCurrency;
};

entity DepositType {
    key id: Integer;
    name: String(50);
    deposits: Association to many Deposit on deposits.type = $self;
}

entity DepositCurrency {
    key id: Integer;
    name: String(50);
    deposits: Association to many Deposit on deposits.currency = $self;
}

entity Loan {
    key id: Integer;
    customer: Association to Customer;
    contractNumber: String(50);
    contractTermMonth: Integer;
    initialSum: DecimalFloat;
    percentage: Integer;
    paymentPerMonth: DecimalFloat;
    totalSum: DecimalFloat;
    type: Association to LoanType;
    currency: Association to LoanCurrency;
}

entity LoanType {
    key id: Integer;
    name: String(50);
    loans: Association to many Loan on loans.type = $self;
}

entity LoanCurrency {
    key id: Integer;
    name: String(50);
    loans: Association to many Loan on loans.currency = $self;
}